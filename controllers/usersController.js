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
    
    const { name, email, password } = req.body;
    
    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });  
        }

        // Insert user
        user = new User({
            name, 
            email,
            password 
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Send user information in the response
        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.json({ msg: 'Registration successful', user: userInfo });

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

                // Send user information in the response
                const userInfo = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
                console.log(userInfo);
                res.json({token, user: userInfo});
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error'); 
    }
};


module.exports.followRequest = async (req, res) => {
    try {
      const userToRequest = await User.findById(req.params.id);
  
      // Check user exists
      if(!userToRequest) {
        return res.status(404).json({msg: 'User not found'});
      }
      
      // Make sure not already sent request
      if(userToRequest.followerRequests.includes(req.user.id)) {
        return res.status(400).json({msg: 'Request already sent'});
      }
  
      // Add follower request
      userToRequest.followerRequests.push(req.user.id);
  
      await userToRequest.save();
  
      res.json({msg: 'Request sent successfully'});
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
};

module.exports.acceptRequest = async (req, res) => {
    try {
  
      const userToAccept = await User.findById(req.params.id); 
      
      // Remove from follower requests
      const removeIndex = userToAccept.followerRequests.indexOf(req.user.id);
      userToAccept.followerRequests.splice(removeIndex, 1);
  
      await userToAccept.save();
  
      // Add as a follower
      userToAccept.followers.push(req.user.id);
      await userToAccept.save();
  
      // Add user to current user's following list
      req.user.following.push(userToAccept.id);
      await req.user.save();
  
      res.json({msg: 'Follow request accepted'});
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
};

module.exports.blockUser = async (req, res) => {
    try {
        const userToBlock = await User.findById(req.params.id);

        // Check if user exists
        if (!userToBlock) {
        return res.status(404).json({ msg: 'User not found'});
        }

        // Check if already blocked
        if(req.user.blocked.includes(req.params.id)) {
        return res.status(400).json({ msg: 'User already blocked'});
        }
    
        // Remove from followers
        const removeIndex = userToBlock.followers.indexOf(req.user.id);
        userToBlock.followers.splice(removeIndex, 1);
        await userToBlock.save();

        // Add user to blocked  
        req.user.blocked.push(userToBlock.id);
        const removeIndex2 = req.user.followers.indexOf(userToBlock);
        req.user.followers.splice(removeIndex2, 1)
        await req.user.save();
        
        res.json({ msg: 'User blocked successfully' });
  
    } catch (err) {
       console.error(err);
       res.status(500).send('Server Error');
    }  
};