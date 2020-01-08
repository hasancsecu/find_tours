const crypto = require('crypto');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sequre: req.sequre || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        password,
        passwordConfirm
    } = req.body;

    const user = await User.findOne({
        email
    });
    // 1) Check if email and password exists
    if (!name || !email || !password || !passwordConfirm) {
        return next(new AppError('Please Fill Out All The Fields', 401));
    }
    if (user) {
        return next(new AppError('This Email is Already Registered. Please Try Another!'), 401);
    }
    if (password !== passwordConfirm) {
        return next(new AppError('Passwords Aren\'t Match!'), 401);
    }
    if (password.length < 8) {
        return next(new AppError('Password Should At Least 8 Characters Long'), 401);
    }

    const newUser = await User.create(req.body);

    const code = Math.floor(100000 + Math.random() * 900000);
    const url = `${req.protocol}://${req.get('host')}/confirm-account/${newUser._id}/${code}`;
    await new Email(newUser, url, code).sendWelcome();

    res.status(201).json({
        status: 'success',

    });
    //createSendToken(newUser, 201, req, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please Provide Both Email and Password', 400));
    }
    // 2) Check if there is user & password is correct
    const user = await User.findOne({
        email
    }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Invalid Email or Password!', 401));
    }
    if (!user.confirmCode) {
        return next(new AppError('Your Account is Not Yet Verified! Pleasy Verify Your Email'), 401);
    }
    // 3) if everything is okay, send token to user
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token & check if it is there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You Are Not Logged In.Please Login To Get Access', 401));
    }
    // 2) verification token
    const decoder = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) Check if there is user already exists
    const freshUser = await User.findById(decoder.id);
    //console.log(freshUser);
    if (!freshUser) {
        return next(new AppError('The User Belonging To This Token No Longer Exists', 401));
    }

    //4) Check if user changed his password after token had issued
    if (!freshUser.changePasswordAfter(decoder.iat)) {
        return next(new AppError('Recently You Have Changed Your Password. Please Login Again', 401));
    }

    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You Are Not Permitted To Do This Action', 403));
        }

        next();
    }
};

exports.isLoggedIn = async (req, res, next) => {
    // 1) Getting token & check if it is there
    if (req.cookies.jwt) {
        try {
            // 1) verification token
            const decoder = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            //3) Check if there is user already exists
            const freshUser = await User.findById(decoder.id);
            //console.log(freshUser);
            if (!freshUser) {
                return next();
            }

            //4) Check if user changed his password after token had issued
            if (!freshUser.changePasswordAfter(decoder.iat)) {
                return next();
            }

            // There is a logged in user
            res.locals.user = freshUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user
    const user = await User.findOne({
        email: req.body.email
    });
    if (!req.body.email) {
        return next(new AppError('Please Enter Your Email'), 401);
    }
    if (!user) {
        return next(new AppError('There is No User With This Email', 404));
    }
    // 2) Generate a random Token
    const resetToken = user.PaswordResetToken();
    await user.save({
        validateBeforeSave: false
    });


    try {
        //3) send it to user's Email
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
        });
    } catch (err) {
        user.paswordResetToken = undefined;
        user.resetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(new AppError('Error Sending The Email.Please Try Again!', 500));
    }

});


exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get the user based on token;
    const createHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: createHash,
        resetExpires: {
            $gt: Date.now()
        }
    });

    //2) If the token has not expired and there is a user, Set the password
    if (!user) {
        return next(new AppError('Invalid Token or The token Has Been Expired!'), 401);
    }
    if (!req.body.password || !req.body.passwordConfirm) {
        return next(new AppError('Please Fill Out All The Fields', 401));
    }
    if (req.body.password !== req.body.passwordConfirm) {
        return next(new AppError('Passwords Aren\'t Match!'), 401);
    }
    if (req.body.password.length < 8) {
        return next(new AppError('Password Should At Least 8 Characters Long'), 401);
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    //4) Log the user in, send JWT
    res.status(200).json({
        status: 'success'
    });
    //createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get the user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) check if POSTed password is correct
    if (!req.body.password || !req.body.passwordConfirm || !req.body.passwordCurrent) {
        return next(new AppError('Please Fill Out All The Fields'), 401);
    }
    if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your Current Password is Incorrect!', 401));
    }
    if (req.body.password !== req.body.passwordConfirm) {
        return next(new AppError('Passwords Aren\'t Match!', 401));
    }
    // 3)If so, Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4)log user in, send JWT
    createSendToken(user, 200, req, res);
});

exports.confirmAccount = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    console.log(req.params.confirmCode, '  ', req.body.confirmCode);
    if (!req.body.confirmCode) {
        return next(new AppError('Please Enter The 6 Digit code'), 401);
    }
    // if (user.confirmCode) {
    //     return next(new AppError('Your Account is Already Activated! Please Log in'));
    // }
    if (req.body.confirmCode !== req.params.confirmCode) {
        return next(new AppError('Code is Not Correct! Please Enter The Valid Code', 401));
    }
    user.confirmCode = req.body.confirmCode;
    await user.save({
        validateBeforeSave: false
    });

    res.status(200).json({
        status: 'success'
    });
});