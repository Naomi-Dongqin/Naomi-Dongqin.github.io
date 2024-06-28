const mealKitUtil = require("../modules/mealKit-util");
const express = require('express');
const router = express.Router();

const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const mealKitModel = require("../models/loadDataModel");


//  used on the home page to display the featured meal kits
function getFeaturedMealKits (mealKits) {
    let filtered = [];
    for (let i = 0; i < mealKits.length; i++) {
        if (mealKits[i].featuredMealKit) {
            filtered.push(mealKits[i]);
        }
    }
    return filtered;
};


// Setup a home page route
router.get("/", (req, res) => {
    mealKitModel.find()
        .then(data => {
            // Convert Mongoose documents to plain JavaScript objects
            const mealKitsList = data.map(value => value.toObject());

            // Group meal kits by category
            const mealKits = getFeaturedMealKits(mealKitsList);

            res.render("general/home", {
                mealKits,
                // variable used in main.ejs
                title: "Home Page",
                css: "/css/home.css"
            });
        })
        .catch(err => {
            console.log("No featured mealKit in the database" + err);
            res.render("general/error", {
                title: "Error page",
                message:"The area is empty"
            });

        });
});


router.get("/welcome", (req, res) => {
    res.render("general/welcome", {
        title: "welcome"
    });
});


router.get("/sign-up", (req, res) => {
    res.render("general/sign-up", {
        title: "Register Page",
        validationSignUpMessage: {},
        values: {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        }
    });
})

router.post("/sign-up", (req, res) => {
    let { firstName, lastName, email, password } = req.body;
    // validate input
    let validationSignUpPassed = true;
    let validationSignUpMessage = {};
    // validate first name (not null and not empty)
    if (typeof (firstName) !== "string") {
        validationSignUpPassed = false;
        validationSignUpMessage.firstName = "Please enter your first name";
    }
    else if (firstName.trim().length === 0 || firstName === "" || firstName === null) {
        validationSignUpMessage.firstName = "first name must contain at least 1 character";
        validationSignUpPassed = false;
    }
    // validate last name (not null and not empty)
    if (typeof (lastName) !== "string") {
        validationSignUpPassed = false;
        validationSignUpMessage.lastName = "Please enter your last name";
    }
    else if (lastName.trim().length === 0 || lastName === "" || lastName === null) {
        validationSignUpMessage.lastName = "last name must contain at least 1 character";
        validationSignUpPassed = false;
    }
    
    //validate email (regular expression)
    const regExp = /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/gm;
    if (typeof (email) !== "string") {
        validationSignUpPassed = false;
        validationSignUpMessage.email = "email is required";
    }
    else if (email.trim().length === 0 || email === null) {
        validationSignUpPassed = false;
        validationSignUpMessage.email = "email must contain at least 1 character";
    }
    else if (!regExp.test(email)) {
        validationSignUpPassed = false;
        validationSignUpMessage.email = "invalid email address";
    }
    //validate password (length is 8-12 and at least one character,one digit, one symbol)
    const passwordReg = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\$@#%^&*()\\[\]{}|\\/~`!?"';:_]){8,12}/g;
   
    if (password === null) {
        validationSignUpPassed = false;
        validationSignUpMessage.password = "password is required";
    }
    else if (password.trim().length === 0) {
        validationSignUpPassed = false;
        validationSignUpMessage.password = "password must contain at least 1 character";
    }
    else if (!passwordReg.test(password)) {
        validationSignUpPassed = false;
        validationSignUpMessage.password = "a password contains 8 to 12 characters at least one lowercase letter, uppercase letter, number and a symbol";
    }
// if passing validate testing, then
    // Check if the email already exists in the database 
    if (validationSignUpPassed) {
        userModel.findOne({
            email: req.body.email
        })
            .then(existingUser => {
                if (existingUser) {
                    // If user already exists, display error message
                    return res.render("general/sign-up", {
                        title: "Register Page",
                        validationSignUpMessage: {
                            email: "Email address already in the user database."
                        },
                        values: req.body
                    });
                }
                else {
                    // no existing user, then a newUser is created
                    const newUser = new userModel({ firstName, lastName, email, password });
                    // save to the database
                    // add bcryptjs in "userModel" will encode the password
                    newUser.save()
                        .then(userSaved => {
                            console.log(`User ${userSaved.firstName} has been added to the database.`);
                            // set up email
                            const sgMail = require("@sendgrid/mail");
                            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
                            // construct an email structure
                            const msg = {
                                to: email,
                                from: "naomiran1989@gmail.com",
                                subject: "Welcome to registrate",
                                html: `Hi, ${firstName} ${lastName}, congratulations on becoming a member of Fresh Eatery<br>
                            Your Email Address: ${email}<br>
                            Student Name: Dongqin Ran <br>`
                            };
                            // send the email
                            sgMail.send(msg)
                                .then(() => {
                                    console.log(`${firstName}`);
                                    // Redirect to welcome page after sending email
                                    res.redirect("/welcome");

                                })
                                .catch(err => {
                                    console.error(err);
                                    res.render("general/sign-up", {
                                        title: "register page",
                                        validationSignUpMessage,
                                        values: req.body
                                    });
                                });
                        })
                        .catch(err => {
                            console.error(`Error adding user to the database: ${err}`);
                            res.render("general/sign-up");
                        });
                }
            })
            .catch(err => {
                console.error(`Error finding user in the database: ${err}`);
                res.render("general/sign-up");
            });
    }
});

// set up route for login page
router.get("/log-in", (req, res) => {
    res.render("general/log-in", {
        title: "Login page",
        validationMessage: {},
        errors: [],
        values: {
            email: "",
            password: "",
            role:""
        }  
    });
});


// Login Route
router.post("/log-in", (req, res) => {
    const { email, password, role } = req.body;
  
    let validated = true;
    let validationMessage = {};

    if (typeof (email) !== "string" || email.trim().length === 0 || email===null) {
        validated = false;
        validationMessage.email = "You must enter one email address";
    }
   else if (email.trim().length < 2) {
        validated = false;
        validationMessage.email = "Email address has at least 1 character";
    }
    if (password.trim().length === 0 || password===null) {
        validated = false;
        validationMessage.password = "password is required";
    }
    if (validated) {

    let errors = [];
    userModel.findOne({ email })
        .then(user => {
            if (user) {
                bcryptjs.compare(password, user.password)
                    .then(matched => {
                        if (matched) {
                            req.session.user = user;
                            req.session.role = role;
                            console.log(`"${role}"`);

                            if (role === "data entry clerk") {
                               // res.redirect("/welcome");
                                res.redirect("mealKits/list");
                            } else if (role === "customer") {
                                 res.redirect("/cart");
                            } else {
                                 res.status(400).render("general/log-in", {
                                    title: "Login page",
                                    validationMessage: validationMessage,
                                    errors: ["Invalid role specified."],
                                    values: req.body
                                });
                            }
                        } else {
                            return res.status(400).render("general/log-in", {
                                title: "Login page",
                                validationMessage: validationMessage,
                                errors: ["Invalid email or password."],
                                values: req.body
                            });
                        }
                    })
                    .catch(err => {
                        console.log("Password comparison error:", err);
                        return res.status(500).render("general/log-in", {
                            title: "Login page",
                            validationMessage: validationMessage,
                            errors: ["Internal server error."],
                            values: req.body
                        });
                    });
            } else {
                return res.status(400).render("general/log-in", {
                    title: "Login page",
                    validationMessage: validationMessage,
                    errors: ["Invalid email or password."],
                    values: req.body
                });
            }
        })
        .catch(err => {
            console.log("User search error:", err);
            return res.status(500).render("general/log-in", {
                title: "Login page",
                validationMessage: validationMessage,
                errors: ["Internal server error."],
                values: req.body
            });
        });
    }else {
        res.render("general/log-in", {
            title: "Login Page",
            validationMessage,
            values:req.body
        });
    } 
});




// Route to the logout page
router.get("/log-out", (req, res) => {

    // Clear the session from memory.
    req.session.destroy();

    // Do NOT do this since more than one variable is existed
    //req.session.user = null;

    res.redirect("/log-in");
});


// Setup a route to cart page
router.get("/cart", (req, res) => {
    if (req.session.role === "customer") {
        res.render("general/cart", {
            title: "cart Page"
        });
    } else {
        res.status(401).render("general/error", {
            title: "Unauthorized",
            message: "Sorry, you have no authority to access this page."
        });
    }
});


module.exports = router;
