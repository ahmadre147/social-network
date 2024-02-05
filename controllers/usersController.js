const User = require('../models/user');
const Post = require('../models/post');
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

        jwt.sign(payload, config.jwtSecret, {expiresIn: '24h'}, 
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
        const userInfo = await User.findById(req.user.id);
        // Check if already blocked
        if(userInfo.blocked.includes(req.params.id)) {
        return res.status(400).json({ msg: 'User already blocked'});
        }
    
        // Remove from followers
        const removeIndex = userToBlock.followers.indexOf(req.user);
        userToBlock.followers.splice(removeIndex, 1);
        await userToBlock.save();

        // Add user to blocked  
        userInfo.blocked.push(userToBlock.id);
        const removeIndex2 = userInfo.followers.indexOf(userToBlock);
        userInfo.followers.splice(removeIndex2, 1)
        await userInfo.save();
        
        res.json({ msg: 'User blocked successfully' });
  
    } catch (err) {
       console.error(err);
       res.status(500).send('Server Error');
    }  
};

module.exports.getUsers = async (req, res) => {
    try {
        // Exclude the current user from the list
        const users = await User.find({ _id: { $ne: req.user.id } }, 'name profilePic');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


module.exports.getFollowerRequests = async (req, res) => {
    try {
      // Get the logged-in user's follower requests
      const followerRequests = await User.findById(req.user.id)
        .populate({
          path: 'followerRequests',
          select: 'name profilePic',
        })
        .select('followerRequests');
  
      res.json(followerRequests.followerRequests);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };

  // Accept follower request
module.exports.acceptFollowerRequest = async (req, res) => {
    try {
        const userToAccept = await User.findById(req.user.id);

        // Check if the user to accept exists
        if (!userToAccept) {
            return res.status(404).json({ msg: 'User not found' });
        }
    
        // Check if the follower request exists
        console.log(`userToAccept.followerRequests \n ${userToAccept.followerRequests}`);
        if (!userToAccept.followerRequests.includes(req.params.id)) {
            return res.status(400).json({ msg: 'Follower request not found' });
        }

        // Remove the follower request
        userToAccept.followerRequests = userToAccept.followerRequests.filter(requesterId => requesterId.toString() !== req.params.id);

        // Add the user to followers
        userToAccept.followers.push(req.params.id);

        // Add to following list
        const requestedUser = await User.findById(req.params.id);
        requestedUser.following.push(req.user.id);

        await userToAccept.save();
        await requestedUser.save();

        res.json({ msg: 'Follower request accepted' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Reject follower request
module.exports.rejectFollowerRequest = async (req, res) => {
    try {
        const userToReject = await User.findById(req.user.id);

        // Check if the user to reject exists
        if (!userToReject) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the follower request exists
        if (!userToReject.followerRequests.includes(req.params.id)) {
            return res.status(400).json({ msg: 'Follower request not found' });
        }

        // Remove the follower request
        userToReject.followerRequests = userToReject.followerRequests.filter(requesterId => requesterId.toString() !== req.params.id);

        await userToReject.save();

        res.json({ msg: 'Follower request rejected' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


module.exports.getUserStatus = async (req, res) => {
    try {
        // Get the logged-in user
        const user = await User.findById(req.user.id);

        // Get followers, following, and posts counts
        const followersCount = user.followers.length;
        const followingCount = user.following.length;

        // Get posts count
        const postsCount = await Post.countDocuments({ postedBy: req.user.id });

        res.json({ followersCount, followingCount, postsCount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports.followingUserPosts = async (req, res) => {
    try {
  
      const user = await User.findById(req.params.userId);
  
      // Check user exists
      if (!user) {
        return res.status(404).json({msg: 'User not found'});
      }
  
      // Check if following
      if(!req.user.following.includes(req.params.userId)) {
        return res.status(403).json({msg: 'Not authorized to see posts'});
      }
  
      const posts = await Post.find({postedBy: req.params.userId}); 
  
      res.json(posts);
  
    } catch(err) {
      console.error(err);
      res.status(500).send('Server Error'); 
    }
};


module.exports.feed = async (req, res) => {
    try {
  
      // Get logged in user
      const user = await User.findById(req.user.id);
  
      // Array of users that current user follows
      const following = user.following; 
  
      // Fetch posts of the users that current user follows
      const posts = await Post.find({ 
        postedBy: { $in: following } 
      })
      .sort({createdAt: -1}) // newest first
      .populate('postedBy', 'id name profilePic');
  
      res.json(posts);
  
    } catch(err) {
      console.error(err);
      res.status(500).send('Server error');
    }
};  

module.exports.getUserNameById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      res.json({ userName: user.name });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
};