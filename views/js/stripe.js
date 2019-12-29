/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from "./alert";

var stripe = Stripe('pk_test_t4VU0pddJLXfit3Lsg8gfvCP00hbLmBew3');

export const bookTour = async tourId => {
    try {
        // 1) Get Chckout Session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        showAlert('error', err.response.data.message);
    }

}