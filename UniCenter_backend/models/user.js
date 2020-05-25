
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    nickname : String,
    auth : String,//google, email, ...
    name : String,
    inst : String,//institution
    email:String,
    password: String,//use only with email
    history : [],
    myDoc : []
    // severity: String
})

const conn = require('../connection/userConn');
const User = conn.model('user',userSchema)
// module.exports = mongoose.model('user', userSchema, 'users');
module.exports = User;