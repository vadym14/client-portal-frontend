/** @type {import('@sveltejs/kit').RequestHandler} */
import Stripe from 'stripe'
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

export async function get({request}: any) {
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const api = new ZecsnExtAPI();
    let filters = [['autopay', '', 'Enabled']]
    let customers = await api.getDocList('Customer', ['name', 'stripe_id', 'customer_name'], filters)
    let terms = customers.map(async (customer) => {
        const project = await api.getValue('Project', ['name'],
            {'customer': customer['name']})
        const salesInvoice = await api.getValue('Sales Invoice', ['name'], {'customer': customer['name']})
        const paymentSchedule = await api.getDoc('Sales Invoice', salesInvoice['name'])
        if (paymentSchedule && paymentSchedule['payment_schedule']) {
            const filteredSchedule = paymentSchedule['payment_schedule'].find((entry: any) => {
                if (entry.paid_amount === 0) {
                    const today = new Date();
                    const date = new Date(entry.due_date);
                    if (today.toDateString() === date.toDateString()) {
                        return true
                    } else false
                } else false
            })
            return {
                project,
                customer: customer,
                paymentSchedule: filteredSchedule
            }
        }
    })
    const paymentSchedule = await Promise.all(terms);
    for (const item of paymentSchedule) {
        if (item.paymentSchedule) {
            const discount = item.paymentSchedule.discount ? (item.paymentSchedule.payment_amount * item.paymentSchedule.discount) / 100 : 0;
            const paymentMethods = await stripe.customers.listPaymentMethods(
                item.customer.stripe_id,
                {type: 'card', limit: 1}
            );
            const amountIntoCent = (item.paymentSchedule['payment_amount'].toFixed(2) - discount.toFixed(2)) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountIntoCent,
                currency: 'usd',
                customer: item.customer.stripe_id,
                payment_method_types: ['card'],
                payment_method: paymentMethods.data[0].id,
                confirm: true,
                off_session: true
            });
            let currentDate = new Date();
            currentDate = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
            let jsonData = {
                'paymentEntry': {
                    'doctype': 'Payment Entry',
                    'naming_series': 'P-ONP-.YY.-',
                    'payment_type': 'Receive',
                    'posting_date': item.paymentSchedule.due_date,
                    'company': 'default',
                    'mode_of_payment': 'Card',
                    'party_type': 'Customer',
                    'party': item.customer.name,
                    'party_name': item.customer.customer_name,
                    'bank_account': '',
                    'paid_from': '',
                    'paid_from_account_currency': 'USD',
                    'paid_to': '',
                    'paid_to_account_currency': 'USD',
                    'paid_amount': parseFloat(amountIntoCent / 100),
                    "received_amount": parseFloat(amountIntoCent / 100),
                    'reference_no': '',
                    'reference_date': currentDate,
                    'project': item.project.name,
                    'cost_center': 'Main - TFS',
                    'references': [{
                        'doctype': 'Payment Entry Reference',
                        'reference_doctype': 'Sales Invoice',
                        'reference_name': item.paymentSchedule.parent,
                        'payment_term': item.paymentSchedule.payment_term,
                        'allocated_amount': parseFloat(amountIntoCent / 100),
                    }],
                    'deductions': [{
                        'doctype': 'Payment Entry Deduction',
                        'account': '',
                        'cost_center': 'Main - TFS',
                        'amount': parseFloat(discount),
                        'description': item.project.name + ' discount taken - payment ' + currentDate,
                    }]
                }
            }
            jsonData.paymentEntry['reference_no'] = paymentIntent.id;
            jsonData.payment_method = paymentIntent.payment_method;
            jsonData['paidStatus'] = paymentIntent.status;

            const paymentMethod = await stripe.paymentMethods.retrieve(jsonData.payment_method);
            if (paymentMethod) {
                switch (paymentMethod['card']['brand']) {
                    case 'visa':
                        jsonData.paymentEntry['mode_of_payment'] = 'Credit Card - Visa';
                        break;
                    case 'mastercard':
                        jsonData.paymentEntry['mode_of_payment'] = 'Credit Card - Mastercard';
                        break;
                    case 'amex':
                        jsonData.paymentEntry['mode_of_payment'] = 'Credit Card - American Express';
                        break;
                    case 'discover':
                        jsonData.paymentEntry['mode_of_payment'] = 'Credit Card - Discover';
                        break;
                }
            }

            const company = await api.getValue('Company', ['company_name', 'default_merchant_bank', 'default_receivable_account', 'default_merchant_account', 'default_discount_account'], [])
            if (company) {
                jsonData.paymentEntry.company = company['company_name'];
                jsonData.paymentEntry.bank_account = company['default_merchant_bank'];
                jsonData.paymentEntry.paid_from = company['default_receivable_account'];
                jsonData.paymentEntry.paid_to = company['default_merchant_account'];
                jsonData.paymentEntry.deductions[0].account = company['default_discount_account'];
                if (jsonData.paidStatus === 'succeeded') {
                    jsonData.paymentEntry.docstatus = 1;
                    const result = await api.insert(jsonData.paymentEntry)
                    console.log(result)
                }
            }
            //
            // const response = await API('POST', `portal/paymentEntry`, {...jsonData});
            // let rjson = await response.json()
            // console.log(rjson)
        } else {
            console.log('False Status')
        }
    }
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': true, 'data': {customers: paymentSchedule}}
    };
}