const Post = require('../models/post');

module.exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.user.id })
      .populate('postedBy', 'name profilePic')
      .sort({ createdAt: -1})

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports.createPost = async (req, res) => {
  const { title, body, photo} = req.body;
  const postedBy = req.user.id;

  try {

    // Create new post 
    const newPost = {
      title, 
      body,
      photo,
      postedBy
    }

    // Upload image 
    // if(photo) {
    //   const result = await cloudinary.uploader.upload(photo);  
    //   newPost.photo = result.url;
    // }

    // Save to db
    let post = new Post(newPost);
    await post.save();

    res.json(post);

  } catch (err) {
    console.error(err)
    res.status(500).send('Server error');
  }

};

module.exports.feed = async (req, res) => {
  try {

    // Get logged in user
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('following', 'id name profilePic');

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

module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Verify post owner
    if(!post) {
      return res.status(404).json({msg: 'Post not found'})
    }

    if(post.postedBy.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'});
    }

    await post.deleteOne();

    res.json({msg: 'Post removed'});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports.createComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Create new comment
    const newComment = {
      user: req.user.id,
      text: req.body.text
    };

    // Add to comments array in post 
    post.comments.unshift(newComment);

    await post.save();

    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  } 
};

module.exports.getUserPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('postedBy', 'name profilePic')
      .populate('comments.user', 'name profilePic'); 

    res.json(post);
  
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};