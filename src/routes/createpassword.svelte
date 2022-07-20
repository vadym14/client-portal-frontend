<script>
    import { goto } from '$app/navigation';
    import {userInfo} from "../lib/store/UserInfoStore.ts";

    let password = '';
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/s;
    let accValidation = '', errorClass='', btnDisable = false , btnLoading = false;
    const handleCreatePassword = () => {
        errorClass = '';
        btnDisable = btnLoading = true;
        if (!regex.test(password)) {
            errorClass = 'input-error';
            btnDisable = btnLoading = false;
            accValidation = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
        }  else {
            accValidation = '';
            $userInfo.user.new_password = password;
            goto('/personinfo');
        }
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
                        <input type="password" placeholder="Password" bind:value={password} class="{`input input-bordered w-full max-w-s ${password==='' || errorClass!== '' ?  errorClass:''} `}"/>
                        <p class="text-red-700 mt-1 text-xs">{accValidation}</p>
                    </div>
                </div>
                <button disabled={btnDisable}
                        class={`btn btn-primary w-full self-end mt-24 ${btnLoading?'loading':''}`} on:click={()=>handleCreatePassword()}>
                    Continue
                </button>
            </div>
        </div>
    </div>
</div>