var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const passport = require('passport');
const session = require('express-session');
require('./passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*
app.use('/', indexRouter);
app.use('/users', usersRouter);
*/
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req,res,next)=>{
  if(req.user){
    next();
  }else{
    res.sendStatus(401);
  }
}
// Base route
app.get('/home',(req,res)=>{
  res.send("Home page");
});
// Google auth consent screen route
app.get('/google',
passport.authenticate('google',{
  scope:
  ['email','profile']
})
);
// Call back route
app.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/failed',
  }),
  function(req,res){
    res.redirect('/success');
  }  
);
// failed route if the authentication fails
app.get("/failed", (req, res) => {
  console.log('User is not authenticated');
  res.send("Failed")
});
// Success route if the authentication is successful
app.get("/success",isLoggedIn, (req, res) => {
  console.log('You are logged in');
  res.send(`Welcome ${req.user.displayName}`)
});
// Route that logs out the authenticated user  
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.log('Error while destroying session:', err);
      } else {
          req.logout(() => {
              console.log('You are logged out');
              res.redirect('/home');
          });
      }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
