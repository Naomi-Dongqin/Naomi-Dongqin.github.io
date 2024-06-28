const mealKitUtil = require("../modules/mealKit-util");

const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');


const mealKitModel = require("../models/loadDataModel");

// Function to group meal kits by category
function getMealKitsByCategory(mealKitsList) {
    let groupedByCategory = {};
    for (let i = 0; i < mealKitsList.length; i++) {
        let meal = mealKitsList[i];
        if (!groupedByCategory[meal.category]) {
            groupedByCategory[meal.category] = [];
        }
        groupedByCategory[meal.category].push(meal);
    }
    const result = [];
    for (const category in groupedByCategory) {
        if (Object.hasOwnProperty.call(groupedByCategory, category)) {
            const categoryObject = {
                categoryName: category,
                mealKits: groupedByCategory[category]
            };
            result.push(categoryObject);
        }
    }
    return result;
}

// Setup a route to return the menu page
router.get("/on-the-menu", (req, res) => {
    // Get all meal kits from the database, sorted by title
    mealKitModel.find().sort({ title: 1 })
        .then(data => {
            // Convert Mongoose documents to plain JavaScript objects
            const mealKitsList = data.map(value => value.toObject());

            // Group meal kits by category
            const groupedMealKits = getMealKitsByCategory(mealKitsList);

            // Render the menu page with the grouped meal kits
            res.render("mealKits/on-the-menu", {
                title: "Menu Page",
                message: "Welcome to the menu page.",
                mealKitsByCategory: groupedMealKits
            });
        })
        .catch(err => {
            console.error("Error loading data:", err);
            res.status(500).render("error", {
                message: "Error loading data",
                error: err
            });
        });
});



// add a router to add mealkits to list
router.get("/list", (req, res) => {
    // Protect this route, so only "data clerk" users are able to edit data
    if (req.session && req.session.user && req.session.role == "data entry clerk") {
        // Clerk is signed in, load the data
        mealKitModel.find().sort({ title: 1 }) // Sort by title in ascending order
            .then(data => {
                const mealKitsList = data.map(value => value.toObject());
                // check if the data is retrieved
                console.log(data);

                res.render("mealKits/list", {
                    title: "mealKit list Page",
                    message: "Welcome to the list page.",
                    mealKitsList
                }); 
            })
            .catch(err => {
                res.send("No data found in the database");
            });
    } else {
        res.status(403).render("general/error", {
            title: "Unauthorized",
            message: "Sorry, you have no authority to access this page."
        });
    }
});

// "mealkits/add" route
router.get("/add", (req, res) => {
    if (req.session && req.session.user && req.session.role == "data entry clerk") {
        res.render("mealKits/add", {
            title: "add mealKit page",
            message: "",
            values:{}
        });
    } else {
        res.status(401).render("general/error", {
            message:"Unauthorized to the page"
        })
    }   
})

router.post("/add", (req, res) => {
    const { title, includes, description, category, price, cookingTime, servings} = req.body;
   
    let featuredMealKit = false;
    if (req.body.featuredMealKit) {
        featuredMealKit = true;
    }

    let imageUrl = " ";

 // Create a new meal kit and save it to the database
 const newMealKit = new mealKitModel({ title, includes, description, category, price, cookingTime, servings,imageUrl,featuredMealKit});

    newMealKit.save()
        .then(mealKitSaved => {
            console.log(`Meal kit "${mealKitSaved.title}" has been added to the database.`);
            
            const allowedExtensions = ['jpg', 'jpeg', 'gif', 'png'];
            const image = req.files.imageUrl;
            // come up with a unique name for each picture, so that it can be storedd in the static folder.
            const uniqueName = `mealKit-pic-${mealKitSaved._id}${path.parse(image.name).ext}`;
            if (allowedExtensions.includes(path.parse(image.name).ext.substring(1).toLowerCase())) {
                // copy the image data to a file on the web server
                image.mv(`assets/mealKit-pic/${uniqueName}`)
                    .then(() => {
                        // save the mealkit picture, update the document
                        mealKitModel.updateOne({
                            _id: mealKitSaved._id
                        }, {
                            imageUrl: uniqueName
                        })
                        // redirect to list page               
                            .then(() => {
                                    console.log("Update the mealKit image successfullly.");
                                    res.redirect("/mealKits/list");
                                })
                                .catch (err=> {
                                    console.log("Couldn't find the data" + err);
                                    res.redirect("/mealKits/list");
                                });           
                            })
                            .catch(err => {
                                console.log(err);
                                res.redirect("/mealKits/list");
                            });      
                                
            } else {
                mealKitModel.deleteOne({ _id: mealKitSaved._id })
                    .then(() => {
                        res.render("mealKits/add", {
                            title: "add mealKits page",
                            message: "Only .JPG,.JPEG,.GIF,.PNG file is allowed,mealKit-saved has deleted from the database",
                            values: req.body
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("mealKits/add", {
                            title: "add mealKits page",
                            message: "Only .JPG,.JPEG,.GIF,.PNG file is allowed,mealKit-saved has deleted from the database",
                            values: req.body
                        });
                    
                    });   
            }
        })
        .catch(err => {
            console.log(err);
            res.render("mealKits/add", {
                title: "add mealKits page",
                message: `Error adding meal kit to the database: ${err}`,
                values: req.body
            });
        });
 });

router.get("/edit/:id", (req, res) => {
  
    if (req.session && req.session.user && req.session.role == "data entry clerk") {
        const id = req.params.id;
        mealKitModel.findOne({ _id:id })
            .then((mealKit) => {
                res.render("mealKits/edit", {
                    title: "Edit page",
                    message: "Find the mealKit in the database",
                    mealKit
                });
            })
            .catch(err => {
                console.log("Couldn't find the mealKit in the database" + err);
                res.redirect("/mealKits/list");
            });
    }  else {
        res.status(401).render("general/error", {
            message:"Unauthorized to the page"
        })
    } 
});


                
router.post("/edit/:id", (req, res) => {

    const id = req.params.id;
    
    const {title, includes, description, category, price, cookingTime, servings} = req.body;
    
    let imageUrlFile;

    imageUrlFile = req.files.imageUrl;

    let featuredMealKit = false;
    
    if (req.body.featuredMealKit) {
        
        featuredMealKit = true;
    }
    // Find the existing document's imageUrl
    let existingUrl;
     mealKitModel.findOne({_id: id})
        .then(item => {
            existingUrl = item.imageUrl;
        })
        .catch(err => console.log(err));
    
    const allowedExtensions = ['jpg', 'jpeg', 'gif', 'png'];

    if (allowedExtensions.includes(path.parse(imageUrlFile.name).ext.substring(1).toLowerCase())){
        
         mealKitModel.updateOne({_id: id}, {
            $set: {title, includes, description, category, price, cookingTime, servings, featuredMealKit}
        })
        .then(() => {
            // make a unique name for the changed imgUrl
            const uniqueName = `mealKit-pic-${id}${path.parse(imageUrlFile.name).ext}`;
            if (uniqueName !== existingUrl) {
                // Copy the image data to a file on the system.
                imageUrlFile.mv(`assets/mealKit-pic/${uniqueName}`)
                    .then(() => {
                     mealKitModel.updateOne({
                        _id: id
                    }, {
                        imageUrl: uniqueName
                    })
                        .then(() => {
                            // Successfully updated document
                            console.log("Updated the mealkit pic");
                            res.redirect("/mealkits/list");
                        })
                        .catch(err => {
                            console.group("Error updating document... " + err);
                            res.redirect("/mealkits/edit");
                        }) 
                    })
                    .catch(err => {
                        console.log("Couldn't move the pic..." + err);
                        res.redirect("/mealkits/edit");      
                    });         
            }
        })
    }
    else {
        res.render("mealkits/editMealkit", {
            title: "Edit Mealkit",
            message:"Only .JPG,.JPEG,.GIF,.PNG file is allowed,mealKit-saved has deleted from the database",
            mealKit: req.body
        })     
    }
    
})


// /mealkits/remove/:id route
router.get("/remove/:id", (req, res) => {

    if (req.session && req.session.user && req.session.role == "data entry clerk") {
        const id = req.params.id;

        mealKitModel.findOne({_id:id })
            .then((mealKit) => {
                if (!mealKit) {
                    // If mealKit is not found, redirect to an error page or display an error message
                    return res.render("general/error", { message: "Meal kit not found" });
                }
                res.render("mealKits/remove", {
                    title: "Remove page",
                    message: "Find the mealKit in the database",
                    mealKit
                });
            })
            .catch(err => {
                console.log("Couldn't find the mealKit in the database" + err);
                res.render("mealKits/list", {
                    title: "Edit page",
                    message: "Couldn't find the mealKit in the database",
                });
            });
        } else {
            res.status(401).render("general/error", {
                message:"Unauthorized to the page"
            })
        } 
});

router.post("/remove/:id", (req, res) => {
    const id = req.params.id;
    mealKitModel.findOne({ _id: id })
        .then(mealKit => {
            if (!mealKit) {
                return res.status(404).send("Meal kit not found");
            }
            // Construct the image file path
            const imagePath = path.join(__dirname, '..', 'assets', 'mealKit-pic', mealKit.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting the file:', err);
                    // Redirect to the error page if file deletion fails
                    return res.redirect(`/mealKits/remove/${id}`);
                }
                // Delete the mealKit document from the database after successfully deleting the image file
                mealKitModel.deleteOne({ _id: id })
                    .then(() => {
                        console.log("The record has been deleted successfully.");
                        res.redirect("/mealKits/list");
                    })
                    .catch(err => {
                        console.log("Couldn't delete the document:", err);
                        res.redirect(`/mealKits/remove/${id}`);
                    });
            });
        })
        .catch(err => {
            console.log("Couldn't find the document:", err);
            res.redirect(`/mealKits/remove/${id}`);
        });
});


module.exports = router;



