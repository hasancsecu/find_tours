/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from "./alert";

export const addreview = async (rating, review, tourId) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/tours/${tourId}/reviews`,
            data: {
                rating,
                review
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Your Review is Succcessfully Added! Thank You For Your Feedback.');
            window.setTimeout(() => {
                location.assign(`/tours/${tourId}`);
            }, 3000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};