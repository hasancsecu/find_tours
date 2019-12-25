const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate Field Value: ${value}. Please use another`;

    return new AppError(message, 400);
};

const handleValidationErrDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid Input Data. ${errors.join('. ')}`;

    return new AppError(message, 400);
};

const handleJwtError = err => new AppError('Invalid token. Please log in again', 401);

const handleJwtExpiredError = err => new AppError('Your token has been expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        console.error('Error: ', err);

        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });

    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    console.error('Error: ', err);

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later!'
    });

};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {
            ...err
        };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJwtError(error);
        if (error.name === 'TokenExpiredError') error = handleJwtExpiredError(error);

        sendErrorProd(error, req, res);
    }
}