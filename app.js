var createError = require('http-errors');
var express = require('express');
var bluebird= require('bluebird');
var path = require('path');

//cors 
var cors = require('cors');
const expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//Start Database connection
var mongoose = require("mongoose");
var config = require("./config");
mongoose.Promise = global.Promise;
mongoose.connect(config.database)
.then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));
//End Database connection
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var localRouter = require('./routes/local');
var carRouter = require('./routes/car');
var app = express();

// view engine setup
app.use(cors({
'allowedHeaders': ['sessionId', 'Content-Type'],
'exposedHeaders': ['sessionId'],
'origin': '*',
'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
'preflightContinue': false
}));
app.use(expressValidator());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/car', carRouter);
app.use('/local', localRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
//cors
 app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
