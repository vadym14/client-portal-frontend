import {writable} from 'svelte/store';
import type {DashBoardInfo} from '$lib/interfaces/user.interface';
import {browser} from "$app/env";

const storedData = JSON.parse(browser && localStorage.getItem('dasboardInfo') || `{}`);

export const DasboardInfo = writable<DashBoardInfo>(browser && storedData || {
    customer: {
        "doctype": '',
        "name": '',
        "customer_name": '',
        "customer_primary_address": '',
        "customer_primary_contact": ''
    },
    contact: {
        "doctype": '',
        "name": '',
        'first_name': '',
        'last_name': '',
        'email_id': '' ,
        'phone': ''
    },
    address: {
        'doctype': '',
        'name': '' ,
        'address_line1': '' ,
        'city': '' ,
        'state': '' ,
        'phone': '',
        'email_id':'',
        'pincode': ''
    },
    user: {
        'doctype': '',
        'name': '' ,
        'first_name': '' ,
        'last_name': '' ,
        'email': '' ,
        'new_password': ''
    },
    project: {
        'doctype':'',
        'name':'',
        'original_creditor':'',
        'creditor_account_number':'',
        'account_open':'',
        'charge_off_date':'',
        'unadjusted_amount':'',
        'plan_1':'',
        'plan_2':'',
        'plan_3':'',
        'plan_4':'',
        'plan_5':'',
    },
    plan:{
        'doctype': '',
        'name': '',
        'settlement_amount': '',
        'forgiven_percentage': '',
        'total_terms': '',
        'docusign_template': '',
        'credit_duration': '',
    }
});

DasboardInfo.subscribe((val) => browser && (localStorage.dasboardInfo = JSON.stringify(val))); // save to local storage for persistence;