import {writable} from 'svelte/store';
import {browser} from "$app/env";

const storedData = JSON.parse(browser && localStorage.getItem('resetPassStore') || `{}`);
// @ts-ignore
export const resetPassStore = writable(browser && storedData || {
    'customer': {
        'doctype': 'Customer',
        'name': '',
        'password': '',
    },
    'user': {
        'doctype': 'User',
        'name': '',
        'new_password': ''
    },
});

resetPassStore.subscribe((val: any) => browser && (localStorage.resetPassStore = JSON.stringify(val))); // save to local storage for persistence;
