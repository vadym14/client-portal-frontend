/** @type {import('@sveltejs/kit').RequestHandler} */
import Stripe from 'stripe'
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

export async function post({request}: any) {
    let status = false
    const data: any = {
        'message': '',
        '_server_messages': [],
    };
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const rjson = await request.json();
    const deduplicatePaymentMethods = async (customer, type) => {
        const fingerprints = [];
        for await (const method of stripe.paymentMethods.list({customer, type})) {
            if (fingerprints.includes(method[type].fingerprint)) {
                await stripe.paymentMethods.detach(method.id);
                console.log(`✌️  Detached duplicate payment method ${method.id}.`);
            } else {
                fingerprints.push(method[type].fingerprint);
            }
        }
    };

    if (rjson.customer) {
        await deduplicatePaymentMethods(rjson.customer, 'card');
    }

    const updateCustomerCardData = {
        'doctype': 'Customer',
        'name': rjson.name,
        'autopay':'Enabled',
        'expiration_month': rjson.data.paymentMethod.card.exp_month,
        'expiration_year': rjson.data.paymentMethod.card.exp_year,
        'account_number': rjson.data.paymentMethod.card.last4,
    }
    const api = new ZecsnExtAPI();
    const customer = await api.update(updateCustomerCardData)
    if (customer) {
        data['customer'] = customer;
        status = true
    } else
        data['message'] = 'Error adding Card, try again'

    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': true, 'data': data}
    };
}