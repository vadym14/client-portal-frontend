/** @type {import('@sveltejs/kit').RequestHandler} */
import Stripe from 'stripe'

export async function post({request}: any) {
    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
    const rjson = await request.json();
    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(rjson.amount),
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        }
    })
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': true, 'data': {client_secret: paymentIntent.client_secret}}
    };
}