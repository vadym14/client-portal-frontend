/** @type {import('@sveltejs/kit').RequestHandler} */
import Stripe from 'stripe'

export async function post({request}: any) {
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const rjson = await request.json();
    const paymentMethod = await stripe.paymentMethods.attach(
        rjson.paymentMethod,
        {
            customer: rjson.customer,
        }
    );
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': true, 'data': {paymentMethod}}
    };
}