// Post Model
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  }, 
  body: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''  
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true 
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
}, {timestamps: true});

module.exports = mongoose.model('Post', PostSchema);