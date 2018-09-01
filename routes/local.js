var express = require('express');
var router = express.Router();
var config = require("../config");
var Data = require('../models/local');

//save/POST local data in database
router.route('/history').post(function (req, res) {
console.log(req.body);
    var data = new Data({
        "model": req.body.model,
        "cost": req.body.Cost,
    });
    // get the current date
    var currentDate = new Date();
    data.created_at = currentDate;
    data.updated_at = currentDate;
    data.save( function (err, data) {
      try{
        if (err) return res.send({ "status": "Error", "message":err });
        return res.send({ "status": "Success", "message": "Added successfully", "localdata": data });
      }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
});

module.exports = router;