const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

// mongoose
const mongoose = require('mongoose');

const apiRouter = require('./routes/api');

const app = express();

// connect to mongoose
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas: CostManagerDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // REST API error handler - returns JSON errors
  res.status(err.status || 500).json({
    error: err.message
  });
});

module.exports = app;
