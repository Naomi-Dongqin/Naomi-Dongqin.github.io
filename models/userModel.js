const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");


// create a schema for our collection
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },   
    password: {
        type: String,
        require: true
    },
    profilePic: String,
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

// before save(), encrypt first
// not use arrow function since that "this" refers to the object binded with it
// instead using function, "this" refers to the parent function
userSchema.pre("save", function (next) {
    let user = this;
    // generate a unique SALT
    bcryptjs.genSalt()
        .then(salt => {
            // Hash the password using the SALT
            bcryptjs.hash(user.password, salt)
                .then(hashedPwd => {
                    user.password = hashedPwd;
                    next();
                })
                .catch(err => {
                    console.log(`Error occureed when hashing ... ${err}`);
                });
        })
        .catch(err => {
            console.log(`Error occureed when salting ... ${err}`);
        }); 
});
// create a model using the user schema
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;