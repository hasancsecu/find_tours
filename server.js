const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION. Shutting Down...');
    process.exit(1);
});

dotenv.config({
    path: './config.env'
});
const app = require('./app');

const DB = 'mongodb+srv://hasan:<PASSWORD>@my-cluster-0ogmf.mongodb.net/natours?retryWrites=true&w=majority'
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("DB connection successful"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION. Shutting Down...');

    server.close(() => {
        process.exit(1);
    });
});