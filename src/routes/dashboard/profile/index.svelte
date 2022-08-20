<script>
    import {onMount} from "svelte";
    import {DasboardInfo} from "../../../lib/store/dashboardinfoStore.ts";
    import {goto} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";
    import {api} from "$lib/_api";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";
    import {loadStripe} from '@stripe/stripe-js'
    import {Elements, PaymentElement} from 'svelte-stripe'

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = {
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
            'email_id': '',
            'phone': ''
        },
        address: {
            'doctype': '',
            'name': '',
            'address_line1': '',
            'city': '',
            'state': '',
            'phone': '',
            'email_id': '',
            'pincode': ''
        },
        user: {
            'doctype': '',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email': '',
            'new_password': ''
        },
        project: {
            'doctype': '',
            'name': '',
            'original_creditor': '',
            'creditor_account_number': '',
            'account_open': '',
            'charge_off_date': '',
            'unadjusted_amount': '',
            'plan_1': '',
            'plan_2': '',
            'plan_3': '',
            'plan_4': '',
            'plan_5': '',
        }
    };
    let disabledInfo = true, btnLoading = false, btnDisable = false, isAddressChanged = false;
    let errorClass = '', emailValidation = '', phoneValidation = '';
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneRegex = /^(\d){3}[-](\d){3}[-](\d){4}$/;
    let autoPay = false, stripe = null, isCardUpdate = false;
    let clientSecret = null, reader, processing, elements;
    const stripeCall = async () => {
        if (autoPay) {
            const paymentMethod = $DasboardInfo.customer['autopay_method'] === 'Credit Card' ? 'card' : 'us_bank_account'
            const response = await api('POST', `portal/setupIntents`, {
                'customer': $DasboardInfo.customer['stripe_id'], paymentMethod
            });
            let rjson = await response.json()
            if (rjson.status) {
                clientSecret = rjson.data.client_secret
                // reader = rjson.data.reader
            }
        }
    }
    onMount(async () => {
        if ($DasboardInfo === {}) {
            goto('/dashboard')
        } else {
            jsonData = {...$DasboardInfo}
            stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
            autoPay = jsonData['customer']?.autopay === 'Enabled' ? true : false
        }
    });

    const submit = async () => {
        if (processing) return
        if (!autoPay) return
        processing = true
        let data = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${import.meta.env.VITE_BASE_URL}/dashboard/profile`,
            },
            redirect: "if_required"
        })
        if (data.setupIntent.status === 'succeeded') {
            const response = await api('POST', `portal/attachPaymentMethod`, {
                'customer': $DasboardInfo.customer['stripe_id'],
                'paymentMethod': data.setupIntent.payment_method,
                'name': $DasboardInfo.customer['name'],
            });
            let rjson = await response.json()
            if (rjson.status) {
                $DasboardInfo.customer = {...rjson.data.customer};
                jsonData = {...$DasboardInfo}
                toast.push("Information saved.", {
                    theme: {
                        '--toastBackground': '#48BB78',
                        '--toastBarBackground': '#2F855A'
                    }
                })
                elements = undefined
                isCardUpdate = false

            }
        }
        processing = false
    }
    const handleProfileContactEdit = () => {
        if (disabledInfo) {
            disabledInfo = false;
        }

    }
    const autoPayDisable = async (value) => {
        //server update status
        const res = await api('POST', `portal/saveCardData`, {
            'doctype': 'Customer',
            'name': $DasboardInfo.customer['name'],
            'autopay': value,
        });
        let rejson = await res.json()
        if (rejson.status) {
            autoPay = value === 'Disabled' ? false : true;
            $DasboardInfo.customer = {...rejson.data.customer};
            $DasboardInfo = {...$DasboardInfo}
            jsonData = {...$DasboardInfo}
        }
    }

    const autoPayEnable = () => autoPay = true;

    const handleAutoPayEdit = async () => {
        await stripeCall();
        isCardUpdate = true;

    };
    const handleProfileSave = async () => {
        btnDisable = btnLoading = true;
        if (jsonData.customer.customer_name === '' || jsonData.contact.email_id === '' || jsonData.contact.phone === '' ||
            jsonData.address.address_line1 === '' || jsonData.address.city === '' || jsonData.address.state === '' || jsonData.address.pincode === '') {
            errorClass = '-error';
            btnDisable = btnLoading = false;
            toast.push('Please edit and fill all information', {
                'theme': {
                    '--toastBackground': '#F56565',
                    '--toastBarBackground': '#C53030'
                }
            })
            if (!disabledInfo && !emailRegex.test(jsonData.contact.email_id)) {
                errorClass = '-error';
                btnDisable = btnLoading = false;
                emailValidation = 'You have entered an invalid email address!';
            }
            if (!disabledInfo && !phoneRegex.test(jsonData.contact.phone)) {
                errorClass = '-error';
                btnDisable = btnLoading = false;
                phoneValidation = 'please match the format. e.g., 100-100-1000';
            }
        } else {
            if (isAddressChanged) {
                jsonData.address.name = '';
            }
            jsonData.user = jsonData.contact.email_id;
            $DasboardInfo = jsonData
            const response = await api('post', `portal/contact`, jsonData);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            if (rjson.status) {
                toast.push('Contact information successfully updated.')
            }
            disabledInfo = true;
            btnDisable = btnLoading = false;
        }

    }

    const addressChanged = () => {
        isAddressChanged = true;
    };

    const regCheck = (value, name) => {
        emailValidation = '';
        phoneValidation = '';
        if (!emailRegex.test(value) && name === 'email') {
            emailValidation = 'You have entered an invalid email address!';
        }
        if (!phoneRegex.test(value) && name === 'phone') {
            phoneValidation = 'please match the format. e.g., 100-100-1000';
        }
    }
</script>

<section class="lg:m-4 bg-base-200">
    <div class="flex lg:flex-row flex-col gap-4">
        <div class="basis-1/2 bg-white p-4">
            <h1 class="text-center text-lg sm:text-center font-semibold">Contact Information</h1>
            <div class="form-control w-full max-w-xl">
                <label class="label">
                    <span class="label-text">Full Name</span>
                </label>
                <input bind:value={jsonData.customer.customer_name}
                       class={`input input-bordered ${jsonData.customer.customer_name===''? ('input'+errorClass):''}`}
                       disabled={disabledInfo}
                       placeholder="Jhon Smith"
                       type="text"/>
            </div>
            <div class="flex lg:flex-row sm:flex-col gap-2 max-w-xl">
                <div class="lg:basis-1/2 sm:basis-1">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">First Name</span>
                        </label>
                        <input bind:value={jsonData.contact.first_name}
                               class={`input input-bordered w-full max-w-s ${jsonData.contact.first_name===''? ('input'+errorClass):''}}`}
                               disabled={disabledInfo}
                               placeholder="New York"
                               type="text"/>
                    </div>
                </div>
                <div class="lg:basis-1/2 sm:basis-1">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">Last Name</span>
                        </label>
                        <input bind:value={jsonData.contact.last_name}
                               class={`input input-bordered w-full max-w-s ${jsonData.contact.last_name===''? ('input'+errorClass):''}}`}
                               disabled={disabledInfo}
                               placeholder="New York"
                               type="text"/>
                    </div>
                </div>
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Email</span>
                </label>
                <input bind:value={jsonData.contact.email_id}
                       class={`input input-bordered ${jsonData.contact.email_id==='' || emailValidation!=='' ?('input'+errorClass):''}`}
                       disabled={disabledInfo}
                       on:input={(e)=> regCheck(e.target.value,'email')}
                       placeholder="Jhon@example.com"
                       type="text"/>
                <p class="text-red-700 mt-1 text-xs">{emailValidation}</p>
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Phone Number</span>
                </label>
                <input bind:value={jsonData.contact.phone}
                       class={`input input-bordered ${jsonData.contact.phone==='' || phoneValidation!=='' ? ('input'+errorClass):''}`}
                       disabled={disabledInfo}
                       on:input={(e)=> regCheck(e.target.value,'phone')}
                       placeholder="646-100-1000"
                       type="text"/>
                <p class="text-red-700 mt-1 text-xs">{phoneValidation}</p>
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Street</span>
                </label>
                <input bind:value={jsonData.address.address_line1} class="input input-bordered" disabled={disabledInfo}
                       on:change={()=>addressChanged()} placeholder="123 fake street"
                       type="text"/>
            </div>
            <div class="flex flex-row gap-2">
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">City</span>
                        </label>
                        <input bind:value={jsonData.address.city} class="input input-bordered w-full max-w-s"
                               disabled={disabledInfo}
                               on:change={()=>addressChanged()} placeholder="New York"
                               type="text"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">State</span>
                        </label>
                        <select bind:value={jsonData.address.state} class="select select-bordered"
                                disabled={disabledInfo} on:change={()=>addressChanged()}>
                            <option disabled selected>Select</option>
                            {#each states as state}
                                <option>{state}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">Code</span>
                        </label>
                        <input bind:value={jsonData.address.pincode} class="input input-bordered w-full max-w-s"
                               disabled={disabledInfo}
                               on:change={()=>addressChanged()} placeholder="10001"
                               type="text"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-control w-full">
                <div class="mt-4">
                    {#if disabledInfo }
                        <button class="btn btn-outline btn-primary btn-wide" on:click={()=>handleProfileContactEdit()}>
                            EDIT
                        </button>
                    {:else}
                        <button class={`btn btn-outline btn-primary btn-wide ${btnLoading?'loading':''}`}
                                on:click={()=>handleProfileSave()}>
                            Save
                        </button>
                    {/if}
                </div>
            </div>
        </div>
        <div class="basis-1/2 bg-white p-4">
            {#if autoPay && !isCardUpdate}
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <h1 class="text-center text-lg sm:text-center font-semibold mb-4">Autopay Setting</h1>
                        <div class="form-control xl:w-full max-w-lg">
                            <label class="label">
                                <span class="label-text">Card Number</span>
                            </label>
                            <input bind:value={jsonData.customer.account_number} disabled class="input input-bordered"
                                   type="text"/>
                        </div>
                        <div class="flex flex-row gap-2 max-w-lg">
                            <div class="basis-1/2">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="text-base font-medium text-gray-900 mb-1">Expiry Month</span>
                                    </label>
                                    <input bind:value={jsonData.customer.expiration_month} disabled
                                           class="input input-bordered w-full max-w-s"
                                           type="text"/>
                                </div>
                            </div>
                            <div class="basis-1/2">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="text-base font-medium text-gray-900 mb-1">Expiry Year</span>
                                    </label>
                                    <input bind:value={jsonData.customer.expiration_year} disabled
                                           class="input input-bordered w-full max-w-s"
                                           type="text"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex xl:flex-row gap-2 flex-col justify-between xl:mt-4">
                        <div class="">
                            <button class="btn btn-outline btn-primary btn-wide"
                                    on:click={()=>autoPayDisable('Disabled')}>
                                DISABLE AUTOPAY
                            </button>
                        </div>
                        <div class="">
                            <button class="btn btn-primary btn-outline btn-wide"
                                    on:click={()=>handleAutoPayEdit()}>
                                EDIT
                            </button>
                        </div>
                    </div>
                </div>
            {:else if autoPay && isCardUpdate && clientSecret}
                <h1 class="text-center text-lg sm:text-center font-semibold mb-4">Autopay Setting</h1>
                {#await clientSecret}
                    <Elements {stripe}
                              {clientSecret}
                              theme="flat"
                              labels="above"
                              variables={{colorPrimary: 'grey',colorBackground:'#fff'}}
                              rules={{'.Input': { border: 'solid 1px #0002' }}}
                              bind:elements>
                        <!--                    <form on:submit|preventDefault={submit}>-->
                        <PaymentElement/>
                        <button on:click={submit()} class="btn btn-primary w-full md:w-1/2" disabled={processing}>
                            {#if processing}
                                Processing...
                            {:else}
                                Save
                            {/if}
                        </button>
                        <!--                    </form>-->
                    </Elements>
                {/await}
            {:else}
                <h1 class="text-center text-lg sm:text-center font-semibold mb-4">Autopay Setting</h1>
                <div class="flex justify-center lg:flex-row gap-2 flex-col lg:mt-52 sm:mt-4">
                    <button class="btn w-1/3 btn-active w-full btn-primary btn-wide"
                            on:click={()=>autoPayEnable()}>
                        ENABLE AUTOPAY
                    </button>
                </div>
            {/if}
        </div>
    </div>

</section>

