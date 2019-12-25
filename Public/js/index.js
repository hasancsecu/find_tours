/* eslint-disable */
import '@babel/polyfill';
import {
    displayMap
} from './mapBox';
import {
    login,
    logout
} from './login';
import {
    signup
} from './signup';
import {
    updateData,
    updatePassword
} from './updateSettings';
import {
    forgotPassword
} from './forgotPassword';
import {
    resetPassword
} from '/resetPassword';
import {
    bookTour
} from './stripe';
import {
    addreview
} from './addReview';
import {
    confirmAccount
} from './confirmAccount';

// DOM Elements
const mapBox = document.getElementById('map');
const logInForm = document.getElementById('btnLog');
const signUpform = document.getElementById('btnSign');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateSettings = document.getElementById('btnUpdateData');
const updateUserPassword = document.getElementById('btnUpdatePassword');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const resetPasswordBtn = document.getElementById('btnResetPassword');
const bookTourBtn = document.getElementById('book-tour');
const addReviewBtn = document.getElementById('btnAddReview');
const confirmCodebtn = document.getElementById('confirmBtn');

// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (logInForm) {
    logInForm.addEventListener('click', async e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await login(email, password);
    });
}

if (signUpform) {
    signUpform.addEventListener('click', async e => {
        e.preventDefault();
        signUpform.textContent = 'Signing up...';
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        await signup(name, email, password, confirmPassword);
        signUpform.textContent = 'Sign Up';
    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updateSettings) {
    updateSettings.addEventListener('click', async e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        await updateData(form);
    });
}

if (updateUserPassword) {
    updateUserPassword.addEventListener('click', async e => {
        e.preventDefault();
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;

        await updatePassword(password, newPassword, confirmPassword);
    })
}

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async e => {
        e.preventDefault();
        forgotPasswordBtn.textContent = 'Sending...';
        const email = document.getElementById('email').value;

        await forgotPassword(email);
        forgotPasswordBtn.textContent = 'Submit';
    });
}

if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async e => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const token = window.location.href.split('/')[4];

        await resetPassword(password, confirmPassword, token);
    });
}

if (bookTourBtn) {
    bookTourBtn.addEventListener('click', async e => {
        e.target.textContent = 'Processing...';
        const {
            tourId
        } = e.target.dataset;
        await bookTour(tourId);
        e.target.textContent = 'Book Tour Now!';
    })
}

if (addReviewBtn) {
    addReviewBtn.addEventListener('click', async e => {
        e.preventDefault();
        const rating = document.getElementById('rating').value;
        const review = document.getElementById('review').value;
        const tourId = window.location.href.split('/')[4];

        await addreview(rating, review, tourId);
    })
}

if (confirmCodebtn) {
    confirmCodebtn.addEventListener('click', async e => {
        e.preventDefault();
        const code = document.getElementById('code').value;
        const userId = window.location.href.split('/')[4];

        await confirmAccount(code, userId);
    });
}