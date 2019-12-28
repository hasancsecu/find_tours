const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Golbal MIDDLEWARE
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set HTTP Security header
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 150,
    windowsMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in an hour!'
});

app.use('/api', limiter);

//Body parser, read data from body into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));
app.use(cookieParser());
// Data sanitiazation against noSQL query injection attack
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// prevent  parameter pollution
app.use(hpp({
    whitelist: ['duration',
        'maxGroupSize',
        'ratingsAverage',
        'difficulty',
        'price',
        'ratingsQuantity'
    ]
}));

app.use(compression());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`cannot find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);
module.exports = app;