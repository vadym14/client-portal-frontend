/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import Stripe from 'stripe'

export async function post({request}: any) {
    let data: any = []
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    const getStripeIds = await api.getDocList('Payment Entry', ['reference_no', 'reference_date'], {'party': rjson.customer}, 0, 100)

    const getPaymentIntents = (getStripeIds: any) => (getStripeIds.map(async (item: any) => {
        const paymentIntent = await stripe.paymentIntents.retrieve(item.reference_no)
        if (paymentIntent) {
            return {
                'date': item.reference_date,
                'amount': paymentIntent.amount,
                'status': paymentIntent.status,
            }
        }
    }))
    if (getStripeIds.length > 0) {
        data = await Promise.all(getPaymentIntents(getStripeIds))
    }
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': true, 'data': data}
    };
}