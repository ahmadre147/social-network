const express = require('express');
const router = express.Router();

const usersCtrl = require('../controllers/usersController.js');
const postsCtrl = require('../controllers/postsController.js');

const { check, validationResult } = require('express-validator');
  
// Import this middleware
const { auth } = require('../middlewares/auth.js');
  
// Users routes  
router.post('/users', [
                check('name')
                    .exists()
                    .withMessage('Name is required'),
                check('email')
                    .isEmail() 
                    .withMessage('Invalid email'),
                check('password')
                    .isLength({ min: 6})
                    .withMessage('Password must be at least 6 characters long'),
            ], usersCtrl.register);

router.post('/users/login', [
                check('email')
                .isEmail()
                .withMessage('Please enter a valid email'),
                check('password')
                .exists()
                .withMessage('Password is required')
            ], usersCtrl.login);

router.post('/users-list', auth, usersCtrl.getUsers);

router.post('/users/block/:id', auth, usersCtrl.blockUser);

router.post('/users/follow-request/:id', auth, usersCtrl.followRequest);

router.post('/users/accept-request/:id', usersCtrl.acceptRequest);

// Posts routes
router.get('/get-posts', auth, postsCtrl.getPosts);

router.post('/posts', auth, [
                check('title')
                .exists()
                .withMessage('Title is required'),
                check('body')
                .exists()
                .withMessage('Body is required')
            ], postsCtrl.createPost);

router.delete('/posts/:id', auth, postsCtrl.deletePost);

router.get('/posts/:id', postsCtrl.getUserPosts);

router.get('/users/follower-requests', auth, usersCtrl.getFollowerRequests);


router.post('/posts/:id/comments', postsCtrl.createComment);

// Accept follower request
router.post('/users/accept-follower-request/:id', auth, usersCtrl.acceptFollowerRequest);

// Reject follower request
router.post('/users/reject-follower-request/:id', auth, usersCtrl.rejectFollowerRequest);

router.get('/users/status', auth, usersCtrl.getUserStatus);

module.exports = router;