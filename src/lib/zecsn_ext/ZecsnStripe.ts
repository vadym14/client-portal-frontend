import Stripe from 'stripe'
import ZecsnExtAPI from "./ZecsnExtAPI";

class ZecsnStripe {

    secretKey = null
    stripe = null
    API = null

    initialize = async () => {
        this.secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY
        this.stripe = new Stripe(this.secretKey)
        this.API = new ZecsnExtAPI();
    }

    createCustomer = async (customer: string) => {

        const customerStripe = await this.stripe.customers.create({
            name: customer,
            description: 'Customer',
        });
        if (customerStripe) {
            const jsonData = {
                'doctype': 'Customer',
                'name': customer,
                'stripe_id': customerStripe.id,
            }
            const customerUpdated = await this.API.update(jsonData)
            return customerUpdated
        }

    }

    setupIntents = async (customer: string, paymentMethod: string) => {
        const intent = await this.stripe.setupIntents.create({
            payment_method_types: [paymentMethod],
            customer: customer,
        });
        return {
            'client_secret': intent.client_secret
        }
    }


    createCard = async (customer: object) => {
        const cardToken = {
            object: 'card',
            number: '',
            exp_month: '',
            exp_year: '',
            cvc: '',
            currency: 'USD',
            name: '',
        }
        const card = await this.stripe.customers.createSource(
            'cus_AJ78ZaALpqgiuZ',
            {source: 'tok_mastercard'}
        );

    }
}

export default ZecsnStripe;