// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
// create a schema
var userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  isactive : Boolean,
  isdeleted : Boolean,
  created_at: Date,
  updated_at: Date
});

//Start Encrypting Password
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { 
    return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});
//End Encrypting Password

//compare password
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};
var User = mongoose.model('User', userSchema);




//encryption password

//decryption password
/**
 * Helper method for validating user's password.
 */
// make this available to our users in our Node applications
module.exports = User;