import axios from 'axios';
import {
    showAlert
} from "./alert";

export const forgotPassword = async (email) => {
    try {

        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Token Successfully Sent to Your Email');
            window.setTimeout(() => {
                location.reload(true);
            }, 4000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}