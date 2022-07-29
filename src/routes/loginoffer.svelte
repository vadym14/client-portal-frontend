<script>
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {api} from "../lib/_api";
    import {userInfo} from "../lib/store/UserInfoStore.ts";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";
    import {toast} from "@zerodevx/svelte-toast";

    let selectOffer = ';'
    let userData = $userInfo, btnLoading = false, btnDisable = false;

    const handleSelectOffer = async (plan) => {
        btnLoading = btnDisable = true;
        let envelopeArgs = {
            signerEmail: $userInfo.user.email,
            signerName: $userInfo.customer.customer_name,
            signerClientId: $userInfo.customer.name,
            emailSubject: '',
            templateId: '',
            dsReturnUrl: import.meta.env.VITE_DOCU_ACCOUNT_LOCAL_RETURN_URL,
        };
        let docuArgs = {
            accessToken:'' ,
            basePath: '',
            accountId: '',
            envelopeArgs: envelopeArgs
        };
        envelopeArgs.emailSubject = `${$userInfo.project.territory} - ${plan.docusign_template} - Settlement Agreement`
        docuArgs.envelopeArgs = envelopeArgs
        $userInfo.project.selected_plan = plan.name;
        selectOffer = plan.name;
        const response = await api('post', `onboarding/plan`, $userInfo);
        let rjson = await response.json()
        handleServerMessages(rjson.data._server_messages)
        if (rjson.status) {
            if(rjson?.data?.ptt?.docusign_template==='Multiple Payments'){
                $userInfo['selected_offer']=plan
                await goto('/selectdate')
            }else{
                await goto('/docusign')
            }

        }
        btnLoading = btnDisable = false;
    }
</script>
<section class="h-screen flex">
    <div class="m-auto">
        <div class="card">
            <div class="sm:p-3 lg:p-10 bg-white container ">
                    <div class="text-2xl mt-4 mb-6 font-medium">Let’s review your offers</div>
                    <div class="flex sm:overflow-scroll xl:overflow-hidden gap-2">
                        {#if (userData.plans)}
                            {#each userData?.plans as plan}
                                <div key={plan.name}
                                     class="w-60 h-[23rem] border hover:border-primary rounded p-5 flex flex-col ">
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
                                    <button class={`btn btn-primary w-52 mt-10 ${btnLoading?'loading':''} ${selectOffer===plan.name?'':'btn-outline'}`}
                                            disabled={btnDisable} on:click={() =>handleSelectOffer(plan)}>Select
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
            </div>
        </div>
    </div>
</section>