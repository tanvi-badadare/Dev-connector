const express = require('express');
const router = express.Router();

// @eoute GET api/posts
// @desc Test route
// @access Public

router.get('/', (req,res) => res.send('Posts route'));

module.exports = router; 
