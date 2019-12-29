import axios from 'axios';
import {
    showAlert
} from "./alert";

export const confirmAccount = async (confirmCode, userId) => {
    try {
        const code = window.location.href.split('/')[5];
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/confirmAccount/${userId}/${code}`,
            data: {
                confirmCode
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Account Confirmation Successful!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 4000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}