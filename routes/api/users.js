import express from 'express';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../../middleware/validate.js';
import { userRegisterSchema } from '../../validation/schemas.js';
import User from '../../models/User.js';

const router = express.Router();
// @eoute POST api/users
// @desc Register user
// @access Public

router.post('/', validate(userRegisterSchema), async (req, res) => {
    const { name, email, password } = req.validatedData;

    try{
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exists'}]});
        }
        
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d:'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password,salt);

        await user.save();
        
        
        const payload ={
            user: {
                id: user.id
            }
        } 
        
        jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            {expiresIn: 360000}, 
            (err,token)=>{
            if(err) throw err;
            res.json({token});
        } );

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');

    }


  }  
);

export default router; 

