<script>
    import {goto} from '$app/navigation';
    import {onMount} from "svelte";
    import {resetPassStore} from "../lib/store/restPasswordStore";
    import {api} from "../lib/_api";
    import {handleServerMessages} from "../lib/utils/handleServerMessages";
    import {toast} from "@zerodevx/svelte-toast";

    let password = '';
    let jsonData = {};
    let errorStatus = false;
    let errorMessage = '';
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/s;
    let accValidation = '', errorClass = '', btnDisable = false, btnLoading = false;
    let previousData = {};
    onMount(() => {
        previousData = {...$resetPassStore};
        if (previousData === {} || previousData?.user?.name === undefined || previousData?.user?.name === '') {
            goto('/userverify');
        } else {
            if ($resetPassStore !== {}) {
                jsonData = {...$resetPassStore};
            }
        }
    })

    const handleCreatePassword = async () => {
        errorClass = '';
        btnDisable = btnLoading = true;
        if (!regex.test(password)) {
            errorClass = 'input-error';
            btnDisable = btnLoading = false;
            accValidation = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
        } else {
            accValidation = '';
            jsonData.user.new_password = password;
            jsonData.customer.password = password;
            const response = await api('post', `reset/passwordUpdate`, jsonData);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            errorStatus = !rjson.status
            if (rjson.status) {
                $resetPassStore = {};
                toast.push('Your password has been updated.')
                await goto('/login');
            } else {
                btnDisable = btnLoading = false;
                errorMessage = rjson.data.message
            }
        }
    };
</script>
<div>
    <div class="flex h-screen  text-gray-600 sm:bg-white lg:bg-base-200">
        <div class="m-auto flex flex-row  w-[31rem] h-[33rem] card ">
            <div class=" w-full bg-white p-10 flex flex-col">
                <h1 class="title-font  text-gray-900 text-3xl font-bold">Reset Password</h1>
                <p class="mt-2">Your password should contain:</p>
                <ul class="list-disc mt-3 list-inside">
                    <li>one lowercase letter</li>
                    <li>one uppercase letter</li>
                    <li>one number</li>
                    <li>one special character @ ! $ & *</li>
                </ul>
                <div class="mt-5">
                    {#if errorStatus}
                        <p class="mt-2 text-base text-error">{errorMessage}</p>
                    {/if}
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">New password</span>
                        </label>
                        <input type="password" placeholder="Password" bind:value={password}
                               class="{`input input-bordered w-full max-w-s ${password==='' || errorClass!== '' ?  errorClass:''} `}"/>
                        <p class="text-red-700 mt-1 text-xs">{accValidation}</p>
                    </div>
                </div>
                <button disabled={btnDisable}
                        class={`btn btn-primary w-full self-end mt-24 ${btnLoading?'loading':''}`}
                        on:click={()=>handleCreatePassword()}>
                    Continue
                </button>
            </div>
        </div>
    </div>
</div>