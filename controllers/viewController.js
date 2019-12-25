const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get Tour data from collection
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId)
        .populate({
            path: 'reviews',
            fields: 'review rating user'
        });

    if (!tour) {
        return next(new AppError('There is no tour with this name', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};

exports.getSignUpForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign Up for an account'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account'
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'My Account',
        user: updatedUser
    });
});

exports.getForgotPasswordForm = (req, res) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgot Password'
    });
};

exports.getResetPassword = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'Password Reset'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({
        user: req.user.id
    });
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({
        _id: {
            $in: tourIds
        }
    });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });

});

exports.getMyReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({
        user: req.user.id
    });

    res.status(200).render('myReviews', {
        title: 'My Reviews',
        reviews
    });
});

exports.addReview = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
        return next(new AppError('There is no tour with this name', 404));
    }
    res.status(200).render('addReview', {
        title: `Add Review On ${tour.name} Tour`,
        tour
    });
});

exports.getConfirm = (req, res) => {
    res.status(200).render('confirmAccount', {
        title: 'Account Confirmation'
    });
};