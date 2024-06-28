const mongoose = require("mongoose");

// create a schema for our collection
const mealKitSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
        //unique:true
    },
    includes: {
        type: String,
        require: true
    },
                
    description: {
        type: String,
        require: true
    },
    
    category: {
        type: String,
        require: true
    },
   
    price: {
        type: Number, // type:Double
        require: true
    },

    cookingTime: {
        type: Number,
        require: true
    },

    servings: {
        type: Number,
        require: true
    },
 
    imageUrl: {
        type: String,
        require: true
    },

// upload file
  //  image:String,

    featuredMealKit: {
        type: Boolean,
        require: true
    },
   
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});



// create a model using the user schema
const mealKitModel = mongoose.model("mealKits", mealKitSchema);

module.exports = mealKitModel;