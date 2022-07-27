<script lang="ts">
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {userInfo} from "../lib/store/UserInfoStore";
    import {toast} from "@zerodevx/svelte-toast";
    import {api} from "../lib/_api";
    import {handleServerMessages} from "../lib/utils/handleServerMessages";

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = {
        'customer': {
            'doctype': '',
            'name': '',
            'customer_name': '',
            'customer_primary_address': '',
            'customer_primary_contact': ''
        },
        'contact': {
            'doctype': '',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email_id': '',
            'phone': ''
        },
        'address': {
            'doctype': '',
            'name': '',
            'address_line1': '',
            'city': '',
            'state': '',
            'email_id': '',
            'phone': '',
            'pincode': ''
        },
        'user': {
            'doctype': '',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email': '',
            'new_password': ''
        },
        "project": {
            'doctype': "",
            'name': '',
            'original_creditor': '',
            'creditor_account_number': '',
            'account_open': '',
            'charge_off_date': '',
            'unadjusted_amount': '',
        },
        "plans": [{
            'name': '',
            'settlement_amount': '',
            'forgiven_percentage': '',
            'total_terms': '',
            'docusign_template': '',
            'credit_duration': '',
        }],
        "register": {
            'name': '',
            'date_of_birth': '',
            'ssn': '',
        }
    };
    let isAddressChanged = false
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneRegex = /^(\d){3}[-](\d){3}[-](\d){4}$/;
    let disabledInfo = true, btnLoading = false, btnDisable = false;
    let errorClass='' , emailValidation = '', phoneValidation =''
    let previousData = {register: {name: undefined, ssn: undefined}}
    onMount(() => {
        previousData = {...$userInfo};
        if (previousData === {} || previousData?.register?.name === undefined || previousData?.register?.ssn === undefined) {
            goto('/register');
        } else {
            if ($userInfo !== {}) {
                jsonData = {...$userInfo};
            }
        }
    })
    const handleSave = async () => {
        btnDisable = btnLoading = true;
        emailValidation = phoneValidation = errorClass = '';

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
        }
            if (!disabledInfo && !emailRegex.test(jsonData.contact.email_id)) {
                errorClass = '-error';
            btnDisable = btnLoading = false;
                emailValidation = 'You have entered an invalid email address!';
            }
            if (!disabledInfo && !phoneRegex.test(jsonData.contact.phone) ) {
                errorClass = '-error';
            btnDisable = btnLoading = false;
                phoneValidation = 'please match the format. e.g., 100-100-1000';
            }
         else {
            if (isAddressChanged) {
                jsonData.address.name = '';
            }
            jsonData.user.first_name = jsonData.contact.first_name;
            jsonData.user.last_name = jsonData.contact.last_name;
            jsonData.user.email = jsonData.address.email_id = jsonData.contact.email_id;
            jsonData.address.phone = jsonData.contact.phone;
            $userInfo = jsonData;
            const response = await api('post', `onboarding/personInfo`, $userInfo);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            if (rjson.status) {
                goto('/yourbestoffer')
            }
            btnDisable = btnLoading = false;
        }
    }
    const handleEdit = () => {
        disabledInfo = false;
    };
    const addressChanged = () => {
        isAddressChanged = true;
    };
    const regCheck = (value,name)=> {
        emailValidation = '';
        phoneValidation= '';
        if (!emailRegex.test(value) && name === 'email') {
            emailValidation = 'You have entered an invalid email address!';
        }
        if (!phoneRegex.test(value) && name === 'phone') {
            phoneValidation = 'please match the format. e.g., 100-100-1000';
        }
    }

</script>
<div class="h-screen flex sm:bg-white lg:bg-base-200">
    <div class="m-auto">
        <div class="card lg:max-w-[60rem] bg-white mt-4 flex">
            <div class="card-body">
                <div class="flex flex-col">
                    <h1 class="sm:text-2xl lg:text-4xl font-semibold">Person Info</h1>
                    <p class="mt-2 sm:text-sm lg:text-base">We’ve located your account. Please review and confirm your
                        contact information:</p>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900">Full Name</span>
                    </label>
                    <input type="text" placeholder="John Smith" bind:value={jsonData.customer.customer_name}
                           disabled={disabledInfo}
                           class={`input input-bordered w-full max-w-s ${jsonData.customer.customer_name===''?('input'+errorClass):''}`}/>
                </div>
                <div class="flex flex-row gap-2">
                    <div class="basis-1/2">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">First Name</span>
                            </label>
                            <input type="text" placeholder="John" bind:value={jsonData.contact.first_name}
                                   disabled={disabledInfo} required={!disabledInfo}
                                   class={`input input-bordered w-full max-w-s ${jsonData.contact.first_name===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                    <div class="basis-1/2">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">Last Name</span>
                            </label>
                            <input type="text" placeholder="Smith" bind:value={jsonData.contact.last_name}
                                   disabled={disabledInfo}
                                   class={`input input-bordered w-full max-w-s ${jsonData.contact.last_name===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900">Email</span>
                    </label>
                    <input type="text" placeholder="john@gmail.com" bind:value={jsonData.contact.email_id}
                           disabled={disabledInfo} on:input={(e)=> regCheck(e.target.value,'email')}
                           class={`input input-bordered w-full max-w-s ${jsonData.contact.email_id==='' || emailValidation!=='' ?('input'+errorClass):''}`}/>
                    <p class="text-red-700 mt-1 text-xs">{emailValidation}</p>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900 ">Phone number</span>
                    </label>
                    <input type="text" placeholder="646-100-1000" bind:value={jsonData.contact.phone}
                           disabled={disabledInfo} on:input={(e)=> regCheck(e.target.value,'phone')}
                           class={`input input-bordered w-full max-w-s ${jsonData.contact.phone==='' || phoneValidation!=='' ? ('input'+errorClass):''}`}/>
                    <p class="text-red-700 mt-1 text-xs">{phoneValidation}</p>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900 ">Street</span>
                    </label>
                    <input type="text" placeholder="123 Fake Street" bind:value={jsonData.address.address_line1}
                           disabled={disabledInfo} on:change={()=>addressChanged()}
                           class={`input input-bordered w-full max-w-s ${jsonData.address.address_line1===''?('input'+errorClass):''}`}/>
                </div>
                <div class="flex lg:flex-row sm:flex-col gap-2">
                    <div class="lg:basis-4/12 sm:basis-1">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 ">City</span>
                            </label>
                            <input type="text" placeholder="New York" bind:value={jsonData.address.city}
                                   disabled={disabledInfo} on:change={()=>addressChanged()}
                                   class={`input input-bordered w-full max-w-s ${jsonData.address.city===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                    <div class="lg:basis-4/12 sm:basis-1">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 ">State</span>
                            </label>
                            <select class={`select select-bordered ${jsonData.address.state===''?('select'+errorClass):''}`}
                                    disabled={disabledInfo} on:change={()=>addressChanged()}
                                    bind:value={jsonData.address.state}>

                                <option value="" disabled selected>Select</option>
                                {#each states as state}
                                    <option value={state}>{state}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="lg:basis-4/12 sm:basis-1">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 ">Code</span>
                            </label>
                            <input type="text" placeholder="10001" bind:value={jsonData.address.pincode}
                                   disabled={disabledInfo} on:change={()=>addressChanged()}
                                   class={`input input-bordered w-full max-w-s ${jsonData.address.pincode===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                </div>
                <div class="flex  w-full gap-2 sm:flex-wrap lg:flex-nowrap flex-col lg:flex-row mt-4 sm:flex-col-reverse">
                    <div class="basis-1/2">
                        <button class="btn w-full btn-wide btn-outline btn-primary" on:click={()=>handleEdit()}>Edit
                        </button>
                    </div>
                    <div class="basis-1/2">
                        <button disabled={btnDisable}
                                class={`btn w-full btn-wide btn-active btn-primary ${btnLoading?'loading':''}`}
                                on:click={()=>handleSave()}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
