const User = require('../models/user');
const jwt = require('jsonwebtoken'); 
const config = require('../config/auth');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

module.exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    const { username, email, password } = req.body;
    
    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });  
        }

        // Insert user
        user = new User({
            username, 
            email,
            password 
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ msg: 'Registration successful' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

module.exports.login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array() 
        });
    }

    const { email, password } = req.body;

    try {
        // Check for existing user
        const user = await User.findOne({ email });

        if (!user) {
        return res.status(400).json({
            message: 'User does not exist'
        });
        }

        // Validate password  
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        return res.status(400).json({
            message: 'Incorrect password'
        });
        }

        // Sign JWT token
        const payload = { 
            user: {
                id: user.id  
            }
        };

        jwt.sign(payload, config.jwtSecret, {expiresIn: 0}, 
        (err, token) => {
            if(err) throw err;
            res.json({token});
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error'); 
    }
  };