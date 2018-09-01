var express = require('express');
var router = express.Router();
var config = require("../config");
// if our user.js file is at models/user.js
var User = require('../models/User');
var bluebird = require('bluebird');
var jwt= require('jsonwebtoken');
//var mailData =require('../models/emailTemplate')
var expressvalidator = require('express-validator');
var error = require('../error');
var smtp = require("../smtp");
//email templates
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');

//save/POST data in database
router.route('/adduser').post(function (req, res) {
///Start check Email is registered or not
  User.findOne({ "email": req.body.email }, function (err, user) {
    //console.log(user.email);
    console.log(req.body.email);
    if (!user) {
      console.log(user);
      const newUser = new User({
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email,
        "password": req.body.password,
        "isactive": req.body.isactive,
        "isdeleted": req.body.isdeleted
      });
      // get the current date
      console.log(newUser);
      var currentDate = new Date();
      newUser.created_at = currentDate;
      newUser.updated_at = currentDate;
console.log(req.body.email)
      console.log('email not Exists: ', req.body.email);
      newUser.save(function (err, user) {
        if (err) return res.send({ "status": "Error", "message": err });
       if(!err){
        
          var template = new EmailTemplate(path.join(templatesDir, 'register'));
    var locals = {
      firstName: req.body.firstname,
      lastName:  req.body.lastname,
      email: req.body.email
    };
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : req.body.email,
        subject : results.subject,
        text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
       
      if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Data Inserted", "users": user });
      }
    }); 
  });
       }
      });

    } else {
      console.log('email Exists: ', req.body.email);
      return res.send({ "message": error.emailregistered });
    }
    //END check Email is registered or not
  });
});

// get total users
router.route('/getalluser/total').get(function (req, res) {
  User.find(function (err, user) {
    if (err)
      return res.send({ "status": "Error", "message": "there is no user" });
    return res.send({
      "status": "Success", "message": "User list",
      "TotalUsers": user
    });
  });
});

//get users by id
//GetByID
router.get('/getByID/:id', function (req, res) {

  User.findById(req.params.id, function (err, user) {
    if (err) return res.send("There was a problem finding the user.");
    if (!user) return res.send("No user found.");
    res.send(user);
  });

});

//use put first
router.route('/users/:email').put(function (req, res) {

  User.findOneAndUpdate({ email: 'akash@gmail.com' }, { firstname: 'aki' }, function (err, user) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "User list", "users": user });
  });
});

//use put for dynamic
//update user
router.route('/updateuser/:email').put(function (req, res) {
  var myquery = { "email": req.body.email };
  var newvalues = {
    $set: {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "password": req.body.password,
      "isactive": req.body.isactive,
      "isdeleted": req.body.isdeleted
    }
  };
  User.update(myquery, newvalues, function (err, user) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "User list", "users": user });
  });
});
   //User Login
   router.post('/login', function (req, res) {
    console.log(req.body.email);
    console.log(req.body.password);
    User.findOne({ email: req.body.email }, function (err, user) {
      
      if (err) return res.send({  auth: false,"message" :"invalid username and password"});
      if (!user) return res.send( {  auth: false,"message":"invalid details"});
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) { 
           res.json({ msg: err,statusCode:400,user: null });
         } else{
           if(isMatch){
          var token = jwt.sign({email:req.body.email,password:req.body.password }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          user.token=token;
          return res.send({ "message":"invalid username password!"});
            }
             return  res.send({ auth: true,"msg":"Login Successfull" ,user: user,token:token });
           
         }
      });     
  });
});

 //User LogOut
  router.get('/logout', function (req, res) {
    res.status(200).send({ auth: false, token: null });
  });
//update password by email 
 router.route('/updatepassword/:email').put(function (req, res) {
    var myquery = { "email": req.params.email };
    var newvalues = {
      $set: {
        "password": req.body.password 
      }
    };
    User.update(myquery, newvalues, function (err, user) {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "User list", "users": user });
    });
  });
  
  //Start Get user by email
router.route('/getuserbyemail/:email').get(function (req, res) {
  User.find({ "email": req.params.email }, function (err, user) {
    try {
      if (user.length)
        return res.send({ "status": "Success", "message": "User list", "users": user });
      return res.send({ "status": "Error", "message": "data not found" });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});
//END Get user by Email
//send email
router.route('/sendemail').get(function (req, res) {
   const errors = req.validationErrors();
  if (errors) {
    return res.send({ "status": "Error", "message": errors });
  }
  User.findOne({ "email": req.body.email }, function (err, user) {
    //console.log(user.email);

    console.log(req.body.email);
    if (!user) {
    var newUser = User({
     "firstname": req.body.firstname,
  "lastname": req.body.lastname,
  "email": req.body.email,
  "password": req.body.password, 
  "isactive" : req.body.isactive,
  "isdeleted" : req.body.isdeleted

    });

    // get the current date
    var currentDate = new Date();
    newUser.created_at = currentDate;
    newUser.updated_at = currentDate;
   
         if (err) return res.send({ "status": "Error", "message": "Email already exists" });
       if(!err){
          
          var template = new EmailTemplate(path.join(templatesDir, 'register'));
    var locals = {
      firstName: req.body.firstname,
      lastName:  req.body.lastname,
      email: req.body.email
    };
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : "akchauhan556@gmail.com",
        subject : results.subject,
        text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
       if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Data Inserted", "users": user });
      }
    }); 
  });
       }
    

    } else {
      console.log('email Exists: ', req.body.email);
      return res.send({ "message": "Email Exist!!" });
    }
    //END check Email is registered or not
  });
});
//send email for resest password
router.route('/resetemail/:email').get(function (req, res) {
    try {
    // "register" is template name
    var template = new EmailTemplate(path.join(templatesDir, 'reset'));
    var locals = {
     
      email:req.params.email

    };
      console.log(locals.email);
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : req.params.email,
        subject : results.subject,
        Text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
      if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Email Send" });
      }
    }); 
  });
    }
  
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });


//send car detail eamil on ask for price
router.post('/sendcardetail', function (req, res) {
  console.log(req.body);
  try {
  
  var template = new EmailTemplate(path.join(templatesDir, 'carprice'));
  var locals = {
     ownername: req.body.ownername,
    customername: req.body.customername,
    email: req.body.customeremail,
    registration_no: req.body.Registration_no,
    Manufacturer: req.body.Manufacturer,
    Model: req.body.Model,
    cost: req.body.cost,
    customerid: req.body.customerid
  };
    template.render(locals, function (err, results){
    if (err) {
    return console.error(err);
  }
  mailData = {
    From : 'test@gmail.com',
    to : 'akchauhan556@gmail.com',
    subject : results.subject,
    Text : results.text,
    html : results.html
}
    var smtpProtocol = smtp.smtpTransport;
    smtpProtocol.sendMail(mailData, function(error, info){
    if (error) {
    res.send({ "status": "Error", "message": error });
    } else {
    return res.send({ "status": "Success", "message": "Email Send" });
      }
    }); 
  });
}
    
    catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
  }
  
  router.route('/changeuserstatus/:email').put(function (req, res) {
    var newvalues = { $set: { isActive: 'true' } };
    User.update({ "email": req.params.email }, newvalues, function (err, user) {
    // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
    try {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "Email verified" });
    }
    catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
    }
    });
  });

  });
  // send reject car status with user  

  router.get('/rejectcar/', function (req, res) {
    console.log(req.body);
    try {
     // "register" is template name
     var template = new EmailTemplate(path.join(templatesDir, 'rejectcar'));
     var locals = {
       name: req.body.name,
       email: req.body.email,
     
     };
       
     template.render(locals, function (err, results){
       if (err) {
           return console.error(err);
       }
       mailData = {
         From : 'test@gmail.com',
         to : req.body.email,
         subject : results.subject,
         Text : results.text,
         html : results.html
         }
      var smtpProtocol = smtp.smtpTransport;
      smtpProtocol.sendMail(mailData, function(error, info){
       if (error) {
         res.send({ "status": "Error", "message": error });
       } else {
         return res.send({ "status": "Success", "message": "Email Sent!" });
       }
     }); 
   });
     }
     catch (err) {
       res.send({ "status": "Error", "message": err });
       throw err
     }
     });

     // change password 
router.route('/changepassword/:email').post(function (req, res) {  
  User.findOne({ "email": req.params.email },function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });   
      if (!user) return res.send({ "message":err});   
      user.comparePassword(req.body.oldpassword, (err, isMatch) => {
        if (err) { 
           res.json({ msg: err,statusCode:400,user: null });
         } else{

          if(isMatch){
            user.password = req.body.password;   
         user.save(function (err, user) {
         return res.send({ "status": "Success", "message": "Password is changed" });
         });
        }
      
      }
  });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});
module.exports = router;