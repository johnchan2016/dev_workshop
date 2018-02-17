var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    userName: String, 
    password: String,
    admin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.comparePassword = function (plainTextPassword){
    return bcrypt.compareSync(plainTextPassword, this.password);
}

module.exports = mongoose.model('Users', userSchema);