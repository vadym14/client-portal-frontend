import {writable} from 'svelte/store';
import type {UserInfo} from '$lib/interfaces/user.interface';
import {browser} from "$app/env";

const storedData = JSON.parse(browser && localStorage.getItem('userinfo') || `{}`);
//register: {},customer:{},contact:{},address:{},user:{}
// @ts-ignore
export const userInfo: writable<UserInfo> = writable<UserInfo>(browser && storedData || {
    'customer': {
        'doctype': '',
        'name': '',
        'customer_name': '',
        'customer_primary_address': '',
        'customer_primary_contact': ''
    },
    'contact': {
        'doctype': '',
        'name': '',
        'first_name': '',
        'last_name': '',
        'email_id': '',
        'phone': ''
    },
    'address': {
        'doctype': '',
        'name': '',
        'address_line1': '',
        'city': '',
        'state': '',
        'email_id': '',
        'phone': '',
        'pincode': ''
    },
    'user': {
        'doctype': '',
        'name': '',
        'first_name': '',
        'last_name': '',
        'email': '',
        'new_password': ''
    },
    "project": {
        'doctype': "",
        'name': '',
        'original_creditor': '',
        'creditor_account_number': '',
        'account_open': '',
        'charge_off_date': '',
        'unadjusted_amount': '',
        'bypass_docusign': '',
        'selected_plan': '',
        'plan_1': '',
        'plan_2': '',
        'plan_3': '',
        'plan_4': '',
        'plan_5': '',
    },
    "plans": [{
        'name': '',
        'settlement_amount': '',
        'forgiven_percentage': '',
        'total_terms': '',
        'docusign_template': '',
        'credit_duration': '',
    }],
    "register": {
        'name': '',
        'date_of_birth': '',
        'ssn': '',
    }
});

userInfo.subscribe((val: any) => browser && (localStorage.userinfo = JSON.stringify(val))); // save to local storage for persistence;
