var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
router.use(cookieParser())

var configs = require('../../configs');
var User = require('../models/user');
let verifyToken = require('../middlewares/verifyToken');

router.post('/login', function(req, res) {
  console.log('secret: ' + req.session.secret);

  // find the user
  User.findOne({
    userName: req.body.userName
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // check if password matches
      if (!user.comparePassword(req.body.password)){
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // create a token with only our given payload
        const payload = {
          userName: user.userName
        };

        //use cookie
        /*
        var token = jwt.sign(payload, configs.jwtSecret,  {
          expiresIn: 60 * 60 * 24 // expires in 24 hours
        });

        res.cookie('token',token);
        */
        //use session
        var token = jwt.sign(payload, req.session.secret,  {
          expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        req.session.token = token;
        req.session.save();
        
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  })
  .catch(function (err) {
      res.send('Error creating user: ', err.message);
  }); 
});

router.post('/register', function(req, res) {
  User.findOne({
    userName: req.body.userName
  }, function(err, user) {
    if(!user){ // user not exist
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        User.create({
          userName: req.body.userName,
          password: hash, 
          admin: req.body.admin
        }, 
        function (err, user) {
          if (err) return res.status(500).send(err);
            console.log('User saved successfully');

          res.json({ success: true });
        });
      });
    }else{
      res.json({
          success: false,
          message: 'Register not success, user already exists.'
      });
    }
  });
});

router.get('/profile', verifyToken , function(req, res) {
  res.send('You can get my profile');
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;