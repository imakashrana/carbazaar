var express = require('express');
var router = express.Router();
var bluebird= require('bluebird');
var Car = require('../models/Car');
var error = require("../error");
var validator = require('validator');
validator.isEmail('foo@bar.com');
// if our user.js file is at models/user.js
var User = require('../models/User');
var Data = require('../models/local');
var multer = require('multer');


var storage = multer.diskStorage({
destination:'../angular/carbazaar/src/assets/uploads',
filename: function (req, file, cb) {
var fileSplit = file.originalname.split(".");
var filename = file.originalname; 
var fileLength = fileSplit.length;
var extension = fileSplit[fileLength-1];
filename = filename.replace("."+extension,"-");
cb( null, filename+ Date.now()+"."+extension);
}
})
var upload = multer({ storage: storage }).single('images');


router.route('/addcar').post(function (req, res) {
console.log(req.body);
upload(req, res, function (err) {
  if (err)
   {
    // An error occurred when uploading
    console.log(err);
  }
   var newCar = new Car({
        "user": req.body.userid,
        "registration_no": req.body.registration_no,
        "model": req.body.model,
        "speedometer": req.body.speedometer,    
        "manufacturer": req.body.manufacturer,
        "cost": req.body.cost,
        "photos": req.file.filename,
        "status": "yes"       
    });
    // get the current date
    var currentDate = new Date();
    newCar.created_at = currentDate;
    newCar.updated_at = currentDate;
    newCar.save(function (err, car) {
      try{
        console.log(req.body.Registration_no);
        if (err) return res.send({ "status": "Error", "message":err });
        return res.send({ "status": "Success", "message": "Car Instered", "cars": car });
      }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
  });
});
  // get total users
router.route('/getallcars/total').get(function (req, res) {
  Car.find(function (err, Car) {
    if (err)
       return res.send({ "status": "Error","message": "there is no car" });
      return res.send({ "status": "Success", "message": "User list",
       "TotalCars": Car });
  });
});
//update user
router.route('/updatecar/:registration_no').put(function (req, res) {
   var myquery = { "registration_no": req.params.registration_no };
   var newvalues = { $set: { "status": req.body.status} };
  Car.update(myquery,newvalues,function (err, Car) {
if (err) return res.send({ "status": "Error","message": err });
  return res.send({ "status": "Success", "message": "Carlist", "Cars": Car });
  });
});

//GetByID
router.get('/getByID/:userid', function (req, res) {
  console.log(req.params.userid)
  var ObjectId = require('mongodb').ObjectId; 
 var id = req.params.userid;       
 var o_id = new ObjectId(id);
 console.log(o_id)
 //db.test.find({_id:o_id})
  Car.find( {user:o_id}, function (err, Car) {
      if (err) return res.send({"message":err});
      if (!Car) return res.send({ "message": err} );
       return res.send({ "status": "Success", "message": "Car by id", "cars": Car });
  });
});
// //Getlocal
// router.get('/getlocal/:userid', function (req, res) {
//   console.log(req.params.userid)
//  //db.test.find({_id:o_id})
//   Car.findOne(function (err, Car){
//       if (err) return res.send({"message":err});
//       if (!Car) return res.send({ "message": err} );
//        return res.send({ "status": "Success", "message": "Car by id", "cars": Car });
//   });
// });
//GetByID
router.get('/getbycarid/:id', function (req, res) {
    Car.findById(req.params.id, function (err, car) {
      if (err) return res.send("There was a problem finding the car.");
      if (!car) return res.send("No car found.");
      return res.send({ "status": "Success", "message": "Get Car by id", "cars": car });
    })
    .populate('user',['firstname','lastname','email','id']);
  
  });

//Getlocal
router.get('/getlocal/:userid', function (req, res) {
  console.log(req.params.userid)
  Car.findById(function (err, Car){
      if (err) return res.send({"message":err});
      if (!Car) return res.send({ "message": err} );
       return res.send({ "status": "Success", "message": "Car by id", "cars": Car });
  });
});
// Update car's status
router.route('/updateCarStatus').put(function (req, res) {
  console.log("test"+req.body.registration_no);
  Car.findOne({ "registration_no": req.body.registration_no},
   function (err, car) {

    if (err) return res.send("There was a problem finding the car.");
      if (!car) return res.send("No found.");
      if(car.status=='accepted') {
        return res.send({ "status": "Success", "message": "A link expired" });
      }
      var newvalues = { $set: { status: 'accepted' } };
    Car.update({ "registration_no": req.body.registration_no, "isdeleted": "false" }, newvalues, function (err, car) {
      try{
        if (err) return res.send({ "status": "Error", "message": err });
        return res.send({ "status": "Success", "message": "Car list", "cars": car });
        //posting data to a new a table 

        var order= new  data({
            "registration_no": req.body.registration_no,
            "model": req.body.model,
            "speedometer": req.body.speedometer,
            "manufacturer": req.body.manufacturer,
            "cost" : req.body.cost,
             "ownername": req.body.ownername,
          "customername": req.body.customername,
          "email": req.body.customeremail,
          "customerid": req.body.customerid
        });
      
        newdata.created_at = currentDate;
        newdata.updated_at = currentDate;

        var customerdata = {
          ownername: req.body.ownername,
          customername: req.body.customername,
          email: req.body.customeremail,
          customerid: req.body.customerid
      };
        
         newdata.save(function (err, car) {
      try{
        console.log(req.body.Registration_no);
        if (err) return res.send({ "status": "Error", "message":err });
        return res.send({ "status": "Success", "message": "Car Instered", "cars": car });
      }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
      }  
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      } 
    });
});
});
  // var values= { $set: {
  //        "registration_no": req.body.registration_no,
  //        "model": req.body.model,
  //        "speedometer": req.body.speedometer,
  //        "manufacturer": req.body.manufacturer,
  //        "cost" : req.body.cost
  //        }
  //        };

// REMOVE/Update car's
router.route('/deletecar/:registration_no').put(function (req, res) {
    var newvalues = { $set: { isdeleted: 'true' } };
    Car.update({ "registration_no": req.params.registration_no }, newvalues, function (err, car) {
        // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
       try{ 
        if (err) return res.send({ "status": "Error", "message": err });
        return res.send({ "status": "Success", "message": "Car Set Deleted successfully!!", "cars": car });
       }
       catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
});
module.exports = router;