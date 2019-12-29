import axios from 'axios';
import {
    showAlert
} from "./alert";

export const resetPassword = async (password, passwordConfirm, token) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'You Have Successfully Reset Your Password!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 3000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}