const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({
    path: './config.env'
});

const DB = 'mongodb+srv://hasan:<PASSWORD>@my-cluster-0ogmf.mongodb.net/natours?retryWrites=true&w=majority'
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("DB connection successful"));

//read data from file
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// import data from DB
const importData = async () => {
    try {
        await Tour.create(tour);
        await User.create(user, {
            validateBeforeSave: false
        });
        await Review.create(review);
        console.log("data imported successfully");

    } catch (err) {
        console.log(err);
    }
    process.exit();
};
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("data deleted successfully");

    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}