import {writable} from 'svelte/store';
import {browser} from "$app/env";

const storedData = JSON.parse(browser && localStorage.getItem('paymentStripe') || "{}");
export const paymentStripe = writable(browser && storedData || {
    "amount": 0,
    "termName": '',
    "dueDate": '',
    'discountAmount': 0,
});
paymentStripe.subscribe((val) => browser && (localStorage.paymentStripe = JSON.stringify(val)));