/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import Stripe from 'stripe'

export async function post({request}: any) {
    let status = false
    const api = new ZecsnExtAPI();
    const rjson = await request.json();
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const paymentMethod = await stripe.paymentMethods.retrieve(rjson.payment_method);
    if (paymentMethod) {
        switch (paymentMethod['card']['brand']) {
            case 'visa':
                rjson.paymentEntry['mode_of_payment'] = 'Credit Card - Visa';
                break;
            case 'mastercard':
                rjson.paymentEntry['mode_of_payment'] = 'Credit Card - Mastercard';
                break;
            case 'amex':
                rjson.paymentEntry['mode_of_payment'] = 'Credit Card - American Express';
                break;
            case 'discover':
                rjson.paymentEntry['mode_of_payment'] = 'Credit Card - Discover';
                break;
        }
    }

    const company = await api.getValue('Company', ['company_name', 'default_merchant_bank', 'default_receivable_account', 'default_merchant_account', 'default_discount_account'], [])
    if (company) {
        rjson.paymentEntry.company = company['company_name'];
        rjson.paymentEntry.bank_account = company['default_merchant_bank'];
        rjson.paymentEntry.paid_from = company['default_receivable_account'];
        rjson.paymentEntry.paid_to = company['default_merchant_account'];
        rjson.paymentEntry.deductions[0].account = company['default_discount_account'];
        if (rjson.paidStatus === 'succeeded') {
            const result = await api.insert(rjson.paymentEntry)
            status = true
        }
    }
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': status, 'data': ''}
    };
}