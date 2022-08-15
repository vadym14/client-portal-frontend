<script>
    import {loadStripe} from '@stripe/stripe-js'
    import {Elements, PaymentElement, LinkAuthenticationElement} from 'svelte-stripe'
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation'
    import {api} from "../../../lib/_api";
    import {toast} from "@zerodevx/svelte-toast";
    import {paymentStripe} from "../../../lib/store/paymentStore";
    import {DasboardInfo} from "$lib/store/dashboardinfoStore";

    let amount = $paymentStripe.amount;
    let stripe = null;
    let clientSecret = null
    let error = null;
    let elements;
    let processing = false
    let currentDate = new Date();
    currentDate = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    let jsonData = {
        'paymentEntry': {
            'doctype': 'Payment Entry',
            'naming_series': 'P-ONP-.YY.-',
            'payment_type': 'Receive',
            'posting_date': $paymentStripe.dueDate,
            'company': 'default',
            'mode_of_payment': 'Card',
            'party_type': 'Customer',
            'party': $DasboardInfo.customer.name,
            'party_name': $DasboardInfo.customer.customer_name,
            'bank_account': '',
            'paid_from': '',
            'paid_from_account_currency': 'USD',
            'paid_to': '',
            'paid_to_account_currency': 'USD',
            'paid_amount': parseFloat(amount),
            "received_amount": parseFloat(amount),
            'reference_no': '',
            'reference_date': currentDate,
            'project': $DasboardInfo.project.name,
            'cost_center': 'Main - TFS',
            'references': [{
                'doctype': 'Payment Entry Reference',
                'reference_doctype': 'Sales Invoice',
                'reference_name': $DasboardInfo.paymentSchedule[0].parent,
                'payment_term': $paymentStripe.termName,
                'allocated_amount': parseFloat(amount),
            }],
            'deductions': [{
                'doctype': 'Payment Entry Deduction',
                'account': '',
                'cost_center': 'Main - TFS',
                'amount': parseFloat($paymentStripe.discountAmount),
                'description': $DasboardInfo.project.name + ' discount taken - payment ' + currentDate,
            }]
        }
    }
    onMount(async () => {
        stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
        // create payment intent server side
        clientSecret = await createPaymentIntent()
    })

    const createPaymentIntent = async () => {
        const response = await api('POST', `portal/paymentIntent`, {amount});
        let rjson = await response.json()
        if (rjson.status) {
            return rjson.data.client_secret
        } else {
            toast.push('Try again', {
                'theme': {
                    '--toastBackground': '#F56565',
                    '--toastBarBackground': '#C53030'
                }
            })
            await goto('/dashboard')
        }
    }

    const submit = async () => {
        // avoid processing duplicates
        if (processing) return

        processing = true
        // confirm payment with stripe
        const result = await stripe
            .confirmPayment({
                elements,
                redirect: 'if_required'
            })
        if (result.error) {
            // payment failed, notify user
            error = result.error
            processing = false
        } else {
            jsonData.paymentEntry['reference_no'] = result.paymentIntent.id;
            jsonData.payment_method = result.paymentIntent.payment_method;
            jsonData['paidStatus'] = result.paymentIntent.status;
            const response = await api('POST', `portal/paymentEntry`, {...jsonData});
            let rjson = await response.json()
            if (rjson.status) {
                const paymentHistory = {
                    'reference_no': result.paymentIntent.id,
                    'termName': $paymentStripe.termName,
                    'posting_date': $paymentStripe.dueDate,
                    'paid_amount': parseFloat(amount)
                };
                $DasboardInfo.paymentHistory.unshift(paymentHistory);
                const data = {...$DasboardInfo}
                $DasboardInfo = data;
                // payment succeeded, redirect to "thank you" page
                toast.push("Paid successfully.", {
                    theme: {
                        '--toastBackground': '#48BB78',
                        '--toastBarBackground': '#2F855A'
                    }
                })
                $paymentStripe = "{}";
            } else {
                toast.push('Payment failed.', {
                    'theme': {
                        '--toastBackground': '#F56565',
                        '--toastBarBackground': '#C53030'
                    }
                })
            }
            await goto('/dashboard')
        }
    }
</script>
<section class="p-4">
    <div class="bg-white p-4">
        <div class="w-full lg:w-1/2">
            {#if error}
                <p class=error>{error.message} Please try again.</p>
            {/if}
            {#if stripe && clientSecret}
                <Elements
                        {stripe}
                        {clientSecret}
                        theme="flat"
                        labels="above"
                        variables={{colorPrimary: 'grey',colorBackground:'#fff'}}
                        rules={{'.Input': { border: 'solid 1px #0002' }}}
                        bind:elements>
                    <form on:submit|preventDefault={submit}>
                        <LinkAuthenticationElement/>
                        <PaymentElement/>

                        <button class="btn btn-primary w-full md:w-1/2" disabled={processing}>
                            {#if processing}
                                Processing...
                            {:else}
                                Pay
                            {/if}
                        </button>
                    </form>
                </Elements>
            {:else}
                Loading...
            {/if}
        </div>
    </div>
</section>
<style>
    .error {
        color: tomato;
        margin: 2rem 0 0;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 2rem 0;
    }
</style>