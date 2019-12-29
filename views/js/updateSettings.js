/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from "./alert";

export const updateData = async (data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMe',
            data
        });
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
            showAlert('success', 'Data is Successfully Updated!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMyPassword',
            data: {
                passwordCurrent,
                password,
                passwordConfirm
            }
        });
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
            showAlert('success', 'Password is Successfully Updated!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};