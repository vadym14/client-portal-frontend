<script lang="ts">
    import {goto} from '$app/navigation';
    import {registerData} from "../lib/store/registerStore";
    import {onMount} from "svelte";

    let jsonData = {
        acc_name: '',
        date_of_birth: '',
        ssn: '',
    }
    let errorClass = '';
    onMount(()=>{
        if($registerData !=={}){
            jsonData = {...$registerData};
        }
    });
    const handleRegSave = () => {
        if (jsonData.acc_name === '' || jsonData.date_of_birth === '' || jsonData.ssn === '') {
            errorClass = 'input-error';
        } else {
            $registerData=jsonData;
            goto('/personinfo')
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
                            <button class="btn w-1/2 btn-primary btn-outline" on:click={()=>goto('./login')}>Login</button>
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
                            <input type="text" placeholder="C-XXX-00-00000" bind:value={jsonData.acc_name}
                                   class={`input input-bordered w-full max-w-s ${jsonData.acc_name===''?errorClass:''}`} />
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">Birth Date</span>
                            </label>
                            <input type="date" bind:value={jsonData.date_of_birth}
                                   class={`input input-bordered w-full max-w-s ${jsonData.date_of_birth===''?errorClass:''}`} />
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font">The last 4 digits of your SSN</span>
                            </label>
                            <input type="text" placeholder="****" bind:value={jsonData.ssn}
                                   class={`input input-bordered w-full max-w-s ${jsonData.ssn===''?errorClass:''}`} />
                        </div>
                    </div>
                    <button class="btn btn-primary w-full mt-10" on:click={()=>handleRegSave()}>Continue</button>
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
