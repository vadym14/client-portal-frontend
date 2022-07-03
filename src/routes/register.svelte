<script lang="ts">
    import { fly } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { variables } from '$lib/utils/constants';
    import { notificationData } from '$lib/store/notificationStore';
    import { post } from '$lib/utils/requestUtils';
    import type { CustomError } from '$lib/interfaces/error.interface';
    import type { UserResponse } from '$lib/interfaces/user.interface';
    import { changeText } from '$lib/helpers/buttonText';
    import {Register} from "$lib/interfaces/user.interface";

    let jsonData = {
        accountNumber: '',
        birthDate: '',
        ssn: '',
    }

    const handleRegSave = () => {

    }

    let register: Register,
         email: string,
        fullName: string,
        bio: string,
        username: string,
        password: string,
        confirmPassword: string,
        errors: Array<CustomError>;
    const submitForm = async () => {
        const [jsonRes, err] = await post(fetch, `${variables.BASE_API_URI}/register/`, {
            user: {
                email: email,
                username: username,
                password: password,
                bio: bio,
                full_name: fullName
            }
        });
        const response: UserResponse = jsonRes;

        if (err.length > 0) {
            errors = err;
        } else if (response.user) {
            notificationData.update(() => 'Registration successful. Login now...');
            await goto('/accounts/login');
        }
    };
    console.log(errors);
    const passwordConfirm = () => (password !== confirmPassword ? false : true);
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>
<section class="h-screen flex bg-white lg:bg-base-200">
    {#if errors}
        {#each errors as error}
            <p class="center error">{error.error}</p>
        {/each}
    {/if}
    <div class=" m-auto">
        <div class="card lg:max-w-[31rem] bg-base-100 ">
            <div class="card-body">
                <div class="sm:p-1 lg:p-4 w-full bg-white container ">
                    <div class="btnShow">
                        <div class="btn-group ">
                            <button class="btn w-1/2 btn-primary btn-outline">Login</button>
                            <button class="btn btn-active w-1/2 whitespace-nowrap">Create Account</button>
                        </div>
                        <p class="mt-2 text-[#717782] flex w-[13rem] mx-auto items-center text-center mt-6">Please enter
                            the following to get started</p>
                    </div>
                    <div class="btnHide">
                        <h1 class="title-font  text-gray-900 text-4xl font-bold">Create Account</h1>
                        <p class="mt-2 text-base">Please enter the following to get started</p>
                    </div>
                    <div class="mt-5">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">Account Number</span>
                            </label>
                            <input type="text" placeholder="C-XXX-00-00000"
                                   class="input input-bordered w-full max-w-s" bind:value={jsonData.accountNumber}/>
                            <label class="label">
                            </label>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">Birth Date</span>
                            </label>
                            <input type="date" placeholder=""
                                   class="input input-bordered w-full max-w-s" bind:value={jsonData.birthDate}/>
                            <label class="label">
                            </label>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">The last 4 digits of your SSN</span>
                            </label>
                            <input type="text" placeholder="****" class="input input-bordered w-full max-w-s"
                                   bind:value={jsonData.ssn}/>
                            <label class="label">
                            </label>
                        </div>
                    </div>
                    <button class="btn btn-primary w-full mt-10" on:click={handleRegSave()}>Continue</button>
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
