const express = require('express');
const router = express.Router();

const usersCtrl = require('../controllers/usersController.js');
const postsCtrl = require('../controllers/postsController.js');

const { check, validationResult } = require('express-validator');
  
// Import this middleware
const { auth } = require('../config/auth.js').auth;
  
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

router.post('/users/block/:id', usersCtrl.blockUser);

router.post('/users/follow-request/:id', usersCtrl.followRequest);

router.post('/users/accept-request/:id', usersCtrl.acceptRequest);

// Posts routes
router.post('/get-posts', postsCtrl.getPosts);

router.post('/posts', [
                check('title')
                .exists()
                .withMessage('Title is required'),
                check('body')
                .exists()
                .withMessage('Body is required')
            ], postsCtrl.createPost);

router.delete('/posts/:id', postsCtrl.deletePost);

router.get('/posts/:id', postsCtrl.getUserPosts);

router.post('/posts/:id/comments', postsCtrl.createComment);

module.exports = router;