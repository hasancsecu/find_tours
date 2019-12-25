const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);
router.get('/tours/:tourId', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignUpForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/forgot-password', viewController.getForgotPasswordForm);
router.get('/reset-password/:token', viewController.getResetPassword);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get('/add-review/:tourId', authController.protect, viewController.addReview);
router.get('/confirm-account/:userId/:confirmCode', viewController.getConfirm);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);
module.exports = router;