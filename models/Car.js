// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a schema
var carSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId, 
        ref:'User'
      },
    registration_no: { type: Number, unique: true },
    model: { type: String},
    speedometer: { type: Number}, 
    manufacturer : String,
    cost : String,
    photos : String,
    status : String,
    isactive : Boolean,
    isdeleted : Boolean,
    created_at: Date,
    updated_at: Date
  });

var Car = mongoose.model('Car', carSchema);

module.exports = Car;
