
let mealKits = [
    {
        title: "Sautéed Ground Pork over Jasmine Rice",
        includes: "Toasted Peanuts & Quick-Pickled Cucumber Salad",
        description: "Gingery pork, crunchy cucumbers, and toasty peanuts.",
        category: "Classic Meals",
        price: 19.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "classical_01.jpg",
        featuredMealKit: false
    },
    {
        title: "Teriyaki Chicken with Steamed Vegetables",
        includes: "White Rice & Sesame Ginger Sauce",
        description: "Juicy teriyaki chicken served with a side of steamed vegetables.",
        category: "Classic Meals",
        price: 24.99,
        cookingTime: 30,
        servings: 2,
        imageUrl: "classical_02.jpg",
        featuredMealKit: false
    },
    {
        title: "Vegetarian Chili with Cornbread",
        includes: "Black Beans, Corn & Avocado Salsa",
        description: "Hearty vegetarian chili topped with avocado salsa, served with warm cornbread.",
        category: "Classic Meals",
        price: 17.99,
        cookingTime: 35,
        servings: 4,
        imageUrl: "classical_03.jpg",
        featuredMealKit: true
    },
    {
        title: "Grilled Salmon with Lemon Dill Sauce",
        includes: "Roasted Potatoes & Green Beans",
        description: "Fresh salmon fillets grilled to perfection, topped with lemon dill sauce, served with roasted potatoes and green beans.",
        category: "Classic Meals",
        price: 26.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "classical_04.jpg",
        featuredMealKit: true
    },
    {
        title: "Mediterranean Grilled Lamb with Couscous",
        includes: "Tzatziki Sauce & Greek Salad",
        description: "Grilled lamb marinated in Mediterranean spices, served with couscous and tzatziki sauce.",
        category: "Mediterranean Delights",
        price: 29.99,
        cookingTime: 40,
        servings: 2,
        imageUrl: "med_01.jpg",
        featuredMealKit: true
    },
    {
        title: "Tex-Mex Beef Tacos with Guacamole",
        includes: "Homemade Tortillas & Salsa",
        description: "Spicy beef tacos with homemade tortillas, served with fresh guacamole and salsa.",
        category: "Mediterranean Delights",
        price: 21.99,
        cookingTime: 20,
        servings: 3,
        imageUrl: "med_02.jpg",
        featuredMealKit: false
    }
];


module.exports.getAllMealKits = function () {
    return mealKits;
}
//  used on the home page to display the featured meal kits
module.exports.getFeaturedMealKits = function (mealKits) {
    let filtered = [];
    for (let i = 0; i < mealKits.length; i++) {
        if (mealKits[i].featuredMealKit) {
            filtered.push(mealKits[i]);
        }
    }
    return filtered;
};

// used on the on-the-menu page to diaplay meal kits grouped into categories
module.exports.getMealKitsByCategory= function (mealKits) {
    let groupedByCategory = {};
    for (let i = 0; i < mealKits.length;i++) {
        let meal = mealKits[i];
        if (!groupedByCategory[meal.category]) {
            groupedByCategory[meal.category] = [];
        }
        groupedByCategory[meal.category].push(meal);
    }
    const result = [];
    for (const category in groupedByCategory) {
        if (Object.hasOwn(groupedByCategory, category)) {
            const categoryObject = {
                categoryName: category,
                mealKits: groupedByCategory[category]
            };
            result.push(categoryObject);
        }
    }
    return result;
}