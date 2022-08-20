<script>
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {api} from "../lib/_api";
    import {userInfo} from "../lib/store/UserInfoStore.ts";
    import {isOpenModal} from "../lib/store/modalStore.ts";
    import Modal from "../components/Modal/Modal.svelte";
    import {InlineCalendar} from "svelte-calendar";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";
    import {toast} from "@zerodevx/svelte-toast";
    import {DasboardInfo} from "../lib/store/dashboardinfoStore.ts";

    let store;
    const theme = {
        calendar: {
            width: '500px',
            shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }
    };

    let envelopeArgs = {
        signerEmail: $userInfo.user.email,
        signerName: $userInfo.customer.customer_name,
        signerClientId: $userInfo.customer.name,
        emailSubject: '',
        templateId: '',
        dsReturnUrl: import.meta.env.VITE_DOCU_ACCOUNT_LOCAL_RETURN_URL,
    };
    let docuArgs = {
        accessToken: '',
        basePath: '',
        accountId: '',
        envelopeArgs: envelopeArgs
    };
    let selectOffer = ';'
    let userData = $userInfo, btnLoading = false, btnDisable = false;
    let previousData = {};
    onMount(async () => {
        if ($DasboardInfo.name !== '') {
            console.log('DasboardInfo.customer.name')
        } else {
            previousData = {...$userInfo};
            if (previousData === {} || previousData.register?.name === undefined || previousData.register?.ssn === undefined) {
                goto('/register');
            } else if (previousData?.address?.email_id === undefined || previousData?.address?.phone === undefined || previousData?.customer?.customer_name === undefined) {
                goto('/personinfo');
            }
        }

    })
    const handleSave = async () => {
        btnLoading = btnDisable = true
        if (selectOffer !== '') {
            let userInfo = userData
            userInfo.docuArgs = docuArgs
            const response = await api('post', `onboarding/plan`, userInfo);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            if (rjson.status) {
                toast.push("Information saved. Please login to continue.", {
                    theme: {
                        '--toastBackground': '#48BB78',
                        '--toastBarBackground': '#2F855A'
                    }
                })
                await goto('/login')
            }
            btnLoading = btnDisable = false
        } else {
            btnLoading = btnDisable = false;
            toast.push("Kindly select offer first", {
                theme: {
                    '--toastBackground': '#F56565',
                    '--toastBarBackground': '#C53030'
                }
            })
        }
    }

    const handleSelectOffer = (plan) => {
        $userInfo.project.selected_plan = plan.name;
        envelopeArgs.emailSubject = `${$userInfo.project.territory} - ${plan.docusign_template} - Settlement Agreement`
        docuArgs.envelopeArgs = envelopeArgs
        selectOffer = plan.name;
    }
</script>
<section class="h-screen flex">
    <div class="m-auto">
        <div class="card">
            <div class="sm:p-3 lg:p-10 bg-white container ">
                <div class="border-solid border rounded-md p-2">
                    <div class="sm:p-2 lg:p-6 w-full">
                        <h1 class="text-lg font-semibold mb-4 text-center lg:text-left">Account Information</h1>
                        <div class="flex lg:flex-row flex-col">
                            <div class="basis-1/2">
                                <div class="flex justify-between sm:text-sm lg:text-base">Name: <span
                                        class="text-[#717782]">{userData?.customer?.customer_name}</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">DOB: <span
                                        class="text-[#717782]">{userData?.register?.date_of_birth}</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">SSN: <span
                                        class="text-[#717782]">{userData?.register?.ssn}</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">Phone Number: <span
                                        class="text-[#717782]">{userData?.address?.phone}</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">Address: <span
                                        class="text-[#717782]">{userData?.address?.address_line1}
                                    , {userData?.address?.city}, {userData?.address?.state}
                                    , {userData?.address?.pincode}</span></div>
                            </div>
                            <div class="divider lg:divider-horizontal divider-vertical"></div>
                            <div class="basis-1/2">
                                <div class="flex justify-between">Creditor: <span
                                        class="text-[#717782]">{userData?.project?.original_creditor}</span></div>
                                <div class="flex justify-between">Creditor Account: <span
                                        class="text-[#717782]">{userData?.project?.creditor_account_number}</span>
                                </div>
                                <div class="flex justify-between">Opening Date: <span
                                        class="text-[#717782]">{userData?.project?.account_open}</span></div>
                                <div class="flex justify-between">Chargeoff Date: <span
                                        class="text-[#717782]">{userData?.project?.charge_off_date}</span>
                                </div>
                                <div class="flex justify-between">Chargeoff Amount: <span
                                        class="text-[#717782]">{userData?.project?.unadjusted_amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-2xl sm:mt-4 lg:mt-10 mb-6 font-medium">Let’s review your offers</div>
                    <div class="flex sm:overflow-scroll xl:overflow-hidden gap-2">
                        {#if (userData.plans)}
                            {#each userData?.plans as plan}
                                <div class="w-60 h-[23rem] border hover:border-primary rounded p-5 flex flex-col justify-between"
                                     key={plan.name}>
                                    <div>
                                        <h2 class="text-center text-lg font-bold">Offer {plan.name}</h2>
                                        <div class="max-w-52 p-3 bg-gray-100 rounded align-center">
                                            <h2 class="text-lg text-blue-500 text-center font-semibold text-primary">
                                                ${plan.settlement_amount}</h2>
                                            {#if (parseInt(plan.settlement_amount) !== parseInt(userData?.project?.unadjusted_amount))}
                                                <span class="text-center flex justify-center line-through  text-sm">{userData?.project?.unadjusted_amount}</span>
                                            {/if}
                                        </div>
                                        <h2 class="text-center text-lg font-semibold text-[#FB896B] mt-4">
                                            {#if (parseInt(plan.forgiven_percentage) > 0)}
                                                {plan.forgiven_percentage}% forgiven
                                            {:else}
                                                no debt forgiveness
                                            {/if}
                                        </h2>
                                        <h2 class="text-center text-sm font-medium mt-3 px-4">{plan.credit_duration}</h2>
                                        <h2 class="text-center text-sm font-medium mt-3 px-4">
                                            {#if (parseInt(plan.total_terms) > 1)}
                                                {plan.total_terms} equal payments of
                                                ${(parseInt(plan.settlement_amount) / parseInt(plan.total_terms)).toFixed(2)}
                                            {/if}
                                        </h2>

                                    </div>
                                    <div>
                                        <button class={`btn btn-primary w-52 mt-10 ${selectOffer===plan.name?'':'btn-outline'}`}
                                                on:click={() =>handleSelectOffer(plan)}>Select
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    <div class="flex lg:flex-row flex-col-reverse lg:justify-end sm:justify-center gap-2 mt-10">
                        <div class="lg:block sm:hidden">
                            <button disabled={btnDisable}
                                    class={`btn lg:btn-wide sm:w-full btn-outline btn-primary ${btnLoading?'loading':''}`}>
                                FAQ
                            </button>
                        </div>
                        <div class="sm:block lg:hidden">
                            <div class="flex justify-end">
                                <svg class="fill-primary stroke-white" width="32" height="32" viewBox="0 0 24 24"
                                     fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_5_980)">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9.09009 8.99999C9.32519 8.33166 9.78924 7.7681 10.4 7.40912C11.0108 7.05015 11.729 6.91893 12.4273 7.0387C13.1255 7.15848 13.7589 7.52151 14.2152 8.06352C14.6714 8.60552 14.9211 9.29151 14.9201 9.99999C14.9201 12 11.9201 13 11.9201 13"
                                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 17H12.01" stroke-width="2" stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <button disabled={btnDisable}
                                    class={`btn lg:btn-wide sm:w-full btn-outline btn-primary ${btnLoading?'loading':''}`}
                                    on:click={()=>goto('https://tarefinancial.com/contact')}>Contact Us
                            </button>
                        </div>
                        <div>
                            <button disabled={btnDisable}
                                    class={`btn lg:btn-wide sm:w-full btn-primary ${btnLoading?'loading':''}`}
                                    on:click={()=>{handleSave()}}>
                                Save & Exit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {#if $isOpenModal}
        <Modal>
            <InlineCalendar bind:store {theme}/>
        </Modal>
    {/if}
</section>