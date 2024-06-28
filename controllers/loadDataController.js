const express = require('express');
const router = express.Router();
const mealKitModel = require("../models/loadDataModel");
// get all mealKits to add to the database
const mealKitUtil = require("../modules/mealKit-util");
const allMealKits = mealKitUtil.getAllMealKits();

router.get("/mealKits", (req, res) => {
    // Protect this route, so only "data clerks" are able to access it.
    if (req.session && req.session.user && req.session.role == "data entry clerk") {
        // Clerk is signed in.

        // We can load the data here.
        mealKitModel.countDocuments()
            .then(count => {
                if (count === 0) {
                    // There are no documents, proceed with the data load.

                    mealKitModel.insertMany(allMealKits)
                        .then(() => {
                            res.render("load-data/loadData", {
                                title:"Load data page",
                                message:"Load data to database successfully!"
                            })
                        })
                        .catch(err => {
                            res.send("Couldn't insert the documents: " + err);
                        });
                }
                else {
                    // There are already documents, don't duplicate them.
                    res.render("load-data/loadData", {
                        title:"Load data page",
                        message:"Those data have existed in the database."
                    })
                }
            });
    }
    else {
        // Clerk is not signed in. Cannot load data, present an error.
        res.status(403).render("general/error", {
            title: "Unauthorized",
            message: "Sorry, you have no authority to access this page."
        });
    }
});



module.exports = router;