<script lang="ts">
    import {goto} from '$app/navigation';
    import {api} from "../lib/_api";
    import {userInfo} from "../lib/store/UserInfoStore";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";

    let regex = /^(?:[a-zA-Z]){1}[-](?:[a-zA-Z]){3}[-](?:\d){2}[-](?:\d){5}$/s;
    let accValidation = '';

    const regCheck = (e) => {
        accValidation = '';
        if (!regex.test(e.target.value)) {
            accValidation = 'please match the format. e.g., C-XXX-00-00000';
        }
    }
    let jsonData = {
        register: {
            name: '',
            date_of_birth: '',
            ssn: '',
        }
    }
    let errorClass = '';
    let errorStatus = false;
    let errorMessage = '';
    let btnDisable = false, btnLoading = false;

    const handleRegSave = async () => {
        accValidation = '';
        btnDisable = true;
        btnLoading = true;
        if (jsonData.register.name === '' || jsonData.register.date_of_birth === '' || jsonData.register.ssn === '') {
            errorClass = 'input-error';
            btnDisable = false;
            btnLoading = false;
        } else if (!regex.test(jsonData.register.name)) {
            btnDisable = false;
            btnLoading = false;
            errorClass = 'input-error';
            accValidation = 'Please match the format. e.g., C-XXX-00-00000';
        } else {
            const response = await api('post', `onboarding/register`, jsonData.register);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            errorStatus = !rjson.status
            if (rjson.status) {
                $userInfo = {...rjson.data, ...jsonData};
                await goto('/createpassword');
            } else {
                btnDisable = false;
                btnLoading = false;
                errorMessage = rjson.data.message

            }
        }
    }
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>
<section class="h-screen flex bg-white lg:bg-base-200">
    <div class=" m-auto">
        <div class="card lg:max-w-[31rem] bg-base-100 ">
            <div class="card-body">
                <div class="sm:p-1 lg:p-4 w-full bg-white container ">
                    <div class="btnShow">
                        <div class="btn-group ">
                            <button class="btn w-1/2 btn-primary btn-outline" on:click={()=>goto('./login')}>Login
                            </button>
                            <button class="btn btn-active w-1/2 whitespace-nowrap">Create Account</button>
                        </div>
                        <p class="mt-2 text-[#717782] flex w-[13rem] mx-auto items-center text-center mt-6">Please enter
                            the following to get started</p>
                        {#if errorStatus}
                            <p class="mt-2 text-[#717782] flex w-[13rem] mx-auto items-center text-center mt-6 text-error">{errorMessage}</p>
                        {/if}
                    </div>
                    <div class="btnHide">
                        <h1 class="title-font  text-gray-900 text-4xl font-bold">Create Account</h1>
                        <p class="mt-2 text-base">Please enter the following to get started</p>
                        {#if errorStatus}
                            <p class="mt-2 text-base text-error">{errorMessage}</p>
                        {/if}
                    </div>
                    <div class="mt-5">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">Account Number</span>
                            </label>
                            <input type="text" placeholder="C-XXX-00-00000" bind:value={jsonData.register.name}
                                   on:input={(e)=> regCheck(e)}
                                   class={`input input-bordered w-full max-w-s ${jsonData.register.name===''?errorClass:''}`}/>
                            <p class="text-red-700 mt-1 text-xs">{accValidation}</p>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">Birth Date</span>
                            </label>
                            <input type="date" bind:value={jsonData.register.date_of_birth}
                                   class={`input input-bordered w-full max-w-s ${jsonData.register.date_of_birth===''?errorClass:''}`}/>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">The last 4 digits of your SSN</span>
                            </label>
                            <input type="text" placeholder="****" bind:value={jsonData.register.ssn} maxlength="4"
                                   class={`input input-bordered w-full max-w-s ${jsonData.register.ssn===''?errorClass:''}`}/>
                        </div>
                    </div>
                    <button disabled={btnDisable} class={`btn btn-primary w-full mt-10 ${btnLoading?'loading':''}`}
                            on:click={()=>handleRegSave()}>Continue
                    </button>
                </div>
            </div>
        </div>
    </div>

</section>

<style>
    @media (min-width: 320px) {
        .btnShow {
            display: block
        }

        .btnHide {
            display: none
        }
    }

    @media (min-width: 1024px) {
        .btnShow {
            display: none
        }

        .btnHide {
            display: block
        }
    }
</style>
