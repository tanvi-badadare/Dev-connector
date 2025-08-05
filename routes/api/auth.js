import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { userLoginSchema } from '../../validation/schemas.js';
import User from '../../models/User.js';

const router = express.Router();


// @eoute GET api/auth
// @desc Test route
// @access Public

router.get('/', auth, async(req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @eoute POST api/auth
// @desc Authenticate user and get token
// @access Public

router.post('/', validate(userLoginSchema), async (req, res) => {
    const { email, password } = req.validatedData;

    try{
        let user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }
        
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }

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
