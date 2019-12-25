const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryController');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.createReview = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);
    const prevReview = await Review.findOne({
        user: req.user.id,
        tour: req.params.tourId
    });
    if (prevReview) {
        return next(new AppError(`You Have Already Given a Review For ${tour.name} Tour. You Can Give Only One Review For A Tour`), 500);
    }
    if (!req.body.review || !req.body.rating) {
        return next(new AppError('Please Fill Out All The Fields'), 401);
    }
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            newReview
        }
    });
});

exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);

exports.getUserReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});