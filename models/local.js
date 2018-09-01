// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a schema
var localSchema = new Schema({
    model: { type: String},
    cost : String,
    speedometer :String,
    manufacturer: String,
    cost: String,
    created_at: Date,
    updated_at: Date
  });

var Data = mongoose.model('Data', localSchema);

module.exports = Data;
