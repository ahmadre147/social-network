const express = require('express');
const router = express.Router();

const usersCtrl = require('../controllers/usersController.js');
const postsCtrl = require('../controllers/postsController.js');

const { check, validationResult } = require('express-validator');

// Users routes  
router.post('/users', [
                check('username')
                    .exists()
                    .withMessage('Username is required'),
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

// Posts routes
router.get('/posts', postsCtrl.getPosts); 
router.post('/posts', postsCtrl.createPost);

module.exports = router;