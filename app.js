const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/db');

const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to DB
mongoose.connect(config.db); 

// Enable req.body parsing
app.use(express.json());

// Use API routes
app.use('/api', userRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});