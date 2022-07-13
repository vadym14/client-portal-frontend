<script>
    import { goto } from '$app/navigation';
    import {registerData} from "../lib/store/registerStore.ts";
    let password = '';
    const handleCreatePassword = () => {
        $registerData.password = password;
        goto('/personinfo');
    };
</script>


<div>

    <div class="flex h-screen  text-gray-600 sm:bg-white lg:bg-base-200">
        <div class="m-auto flex flex-row  w-[31rem] h-[33rem] card ">
            <div class=" w-full bg-white p-10 flex flex-col">
                <h1 class="title-font  text-gray-900 text-3xl font-bold">Create Password</h1>
                <p class="mt-2">Your password should contain:</p>

                <ul class="list-disc mt-3 list-inside">
                    <li>one lowercase letter</li>
                    <li>one uppercase letter</li>
                    <li>one number</li>
                    <li>one special character @ ! $ & *</li>
                </ul>
                <div class="mt-5">

                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">Create your password</span>
                        </label>
                        <input type="password" placeholder="Password" bind:value={password} class="input input-bordered w-full max-w-s"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
                <button class="btn btn-primary w-full self-end mt-24" on:click={()=>handleCreatePassword()}>
                    Continue
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    @media (min-width: 200px) {
        .whithBack {
            background-color: white;
        }
    }
</style>