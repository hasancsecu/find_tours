const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please Confirm Password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords aren't match"
        }
    },
    confirmCode: {
        type: Number
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        select: false
    },
    resetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // Only Run if password is modified
    if (!this.isModified('password')) return next();
    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //delete the unused pasword
    this.passwordConfirm = undefined;
    next();
});

// Document Middleware(this refers to current document)
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Query Middleware(this refers to current query)
userSchema.pre(/^find/, function (next) {
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});

userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.PaswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
const User = mongoose.model('User', userSchema);

module.exports = User;