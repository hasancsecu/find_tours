/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from "./alert";

export const signup = async (name, email, password, confirmPassword) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm: confirmPassword
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'You have Succcessfully Signed Up! Please Check Your Email to Activate Your Account');
            window.setTimeout(() => {
                location.assign('/login');
            }, 5000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};