const express = require('express');
const router = express.Router();

const usersCtrl = require('../controllers/usersController.js');
const postsCtrl = require('../controllers/postsController');

// Users routes  
router.post('/users', usersCtrl.register);
router.post('/users/login', usersCtrl.login);

// Posts routes
router.get('/posts', postsCtrl.getPosts); 
router.post('/posts', postsCtrl.createPost);

module.exports = router;