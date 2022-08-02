<script>
    import {goto} from "$app/navigation";
    import {api} from "../lib/_api";
    import {InlineCalendar} from "svelte-calendar";
    import {userInfo} from "../lib/store/UserInfoStore.ts";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";
    import dayjs from 'dayjs';

    let userData = $userInfo, btnLoading = false, btnDisable = false;
    let store;
    const today = new Date();
    const theme = {
        calendar: {
            width: '24rem',
            shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }
    };
    const handleSave = async () => {
        const jsonData = {
            'name': $userInfo.project.name,
            'start_date': dayjs($store?.selected).format('YYYY-MM-DD'),
            'doctype': 'Project'
        }
        const response = await api('POST', `onboarding/selectDate`, jsonData);
        let rjson = await response.json()
        handleServerMessages(rjson.data._server_messages)
        if (rjson.status) {
            goto('/docusign')
        }
        btnDisable = btnLoading = true;
        // $:console.log("date",dayjs($store?.selected).format('MM/DD/YYYY'))
        btnDisable = btnLoading = false;
    }
</script>
<section class="h-screen flex">
    <div class="m-auto">
        <div class="card">
            <div class="sm:p-3 lg:p-10 bg-white container ">
                <div class="text-2xl mb-6 font-medium">When would you like your payments to begin?</div>
                <div class="flex gap-4 flex-col md:flex-row">
                    {#if (userData['selected_offer'])}
                        <div class="w-[20rem] h-auto border rounded p-5 flex flex-col place-content-center">
                            <h2 class="text-center text-lg font-bold">Offer {userData['selected_offer'].name}</h2>
                            <div class="max-w-52 p-3 bg-gray-100 rounded align-center">
                                <h2 class="text-lg text-blue-500 text-center font-semibold text-primary">
                                    ${userData['selected_offer'].settlement_amount}</h2>
                                {#if (parseInt(userData['selected_offer'].settlement_amount) !== parseInt(userData?.project?.unadjusted_amount))}
                                    <span class="text-center flex justify-center line-through  text-sm">{userData?.project?.unadjusted_amount}</span>
                                {/if}
                            </div>
                            <h2 class="text-center text-lg font-semibold text-[#FB896B] mt-4">
                                {#if (parseInt(userData['selected_offer'].forgiven_percentage) > 0)}
                                    {userData['selected_offer'].forgiven_percentage}% forgiven
                                {:else}
                                    no debt forgiveness
                                {/if}
                            </h2>
                            <h2 class="text-center text-sm font-medium mt-3 px-4">{userData['selected_offer'].credit_duration}</h2>
                            <h2 class="text-center text-sm font-medium mt-3 px-4">
                                {#if (parseInt(userData['selected_offer'].total_terms) > 1)}
                                    {userData['selected_offer'].total_terms} equal payments of
                                    ${(parseInt(userData['selected_offer'].settlement_amount) / parseInt(userData['selected_offer'].total_terms)).toFixed(2)}
                                {/if}
                            </h2>
                        </div>
                    {/if}
                    <div class=" border rounded">
                        <InlineCalendar start={today} bind:store {theme}/>
                    </div>
                </div>
                <div class="text-2xl mt-8 mb-6 font-medium">Next, you will sign the agreement and verify your ID via
                    DocuSign.
                </div>
                <div class="flex justify-end">
                    <button class={`btn btn-primary w-52 ${btnLoading?'loading':''}`}
                            disabled={btnDisable} on:click={()=>{handleSave()}}>Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>