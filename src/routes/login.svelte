<script lang="ts">
    import {api} from '../lib/_api.ts';
    import {goto} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";
    import {handleServerMessages} from "../lib/utils/handleServerMessages";
    import {DasboardInfo} from "../lib/store/dashboardinfoStore";
    import {userInfo} from "../lib/store/UserInfoStore";

    // email validation regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let regex = /^(?:[a-zA-Z]){1}[-](?:[a-zA-Z]){3}[-](?:\d){2}[-](?:\d){5}$/s;
    let email = '', name = '', password = '', errorClass = '', emailValidation = '', accValidation = '',
        btnDisable = false,
        btnLoading = false, errorStatus = false, errorMessage = '';
    const handleLogin = async () => {
        btnDisable = btnLoading = true;
        emailValidation = accValidation = errorClass = '';

        if (email === '' || name === '' || password === '') {
            errorClass = '-error';
            btnDisable = btnLoading = false;
        }
        if (!emailRegex.test(email)) {
            errorClass = '-error';
            btnDisable = btnLoading = false;
            emailValidation = 'You have entered an invalid email address!';
        }
        if (!regex.test(name)) {
            errorClass = '-error';
            btnDisable = btnLoading = false;
            accValidation = 'please match the format. e.g., C-XXX-00-00000';
        } else {
            const jsonData = {
                name,
                usr: email,
                pwd: password
            }
            const response = await api('POST', `auth/login`, jsonData);
            let rjson = await response.json()
            handleServerMessages(rjson.data._server_messages)
            errorStatus = !rjson.status
            if (rjson.status) {
                switch (rjson.data.redirect_url) {
                    case 'dashboard':
                        $DasboardInfo = rjson.data;
                        toast.push(rjson.data.message)
                        await goto('/dashboard');
                        break;
                    case 'loginoffer':
                        $userInfo.user = rjson.data.user;
                        $userInfo.customer = rjson.data.customer;
                        $userInfo.project = rjson.data.project;
                        $userInfo.plans = rjson.data.plans;
                        await goto('/loginoffer')
                        break;
                }
                btnDisable = false;
                btnLoading = false;
            } else {
                errorMessage = rjson.data.message
                btnDisable = false;
                btnLoading = false;
            }
        }
    }
    const regCheck = (value, name) => {
        emailValidation = '';
        accValidation = '';
        errorClass = '';
        if (!emailRegex.test(value) && name === 'email') {
            emailValidation = 'You have entered an invalid email address!';
            errorClass = '-error';
        }
        if (!regex.test(value) && name === 'name') {
            accValidation = 'please match the format. e.g., C-XXX-00-00000';
            errorClass = '-error';
        }
    }
</script>

<section class="">
    <div class="sm:hidden lg:block">
        <div class="flex h-screen  text-gray-600 body-font ">
            <div class="m-auto flex flex-row  w-[53rem] card ">
                <div class="p-4 w-full bg-white container p-6 ">
                    <h1 class="title-font  text-blackhead text-3xl font-bold">Login</h1>
                    <p class="mt-2 text-grey">Sign In to your account</p>
                    <div class=" mt-5">
                        <div class="form-control w-96 max-w-sm">
                            <label class="label">
                                <span class="title-font">Email</span>
                            </label>
                            <input type="text" bind:value={email} placeholder="Please enter your email"
                                   on:input={(e)=> regCheck(e.target.value,'email')}
                                   class={`input input-bordered w-full max-w-s ${email==='' || emailValidation!=='' ? 'input'+errorClass:''}`}/>
                            <p class="text-red-700 mt-1 text-xs">{emailValidation}</p>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font font-medium text-gray-900">Account Number</span>
                            </label>
                            <input type="text" bind:value={name} placeholder="C-XXX-00-00000"
                                   on:input={(e)=> regCheck(e.target.value,'name')}
                                   class={`input input-bordered w-full max-w-s ${name==='' || accValidation !=='' ?'input'+errorClass:''}`}/>
                            <p class="text-red-700 mt-1 text-xs">{accValidation}</p>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font font-medium text-gray-900">Password</span>
                            </label>
                            <input type="password" bind:value={password} placeholder="Please enter your password"
                                   class={`input input-bordered w-full max-w-s ${password===''?'input'+errorClass:''}`}/>
                        </div>
                    </div>
                    <div class="flex flex-row justify-between my-5">
                        <button disabled={btnDisable} class={`btn btn-primary ${btnLoading?'loading':''}`}
                                on:click={()=>handleLogin()}>Login
                        </button>
                        <a href="/userverify" class="btn btn-link underline ">Forgot password?</a>
                    </div>
                    <hr class="text-gray-200"/>
                    <div class="mt-6 text-center">
                        <p class="text-grey">Having problems signing in? - <a href="https://tarefinancial.com/contact"
                                                                              class="btn-link underline">Contact Us</a>
                        </p>
                    </div>
                </div>
                <div class="bg-[#7661E2] w-full flex flex-col">
                    <div class="m-auto">
                        <h1 class="text-white text-4xl font-semibold whitespace-nowrap">Create Account</h1>
                        <button class=" flex mx-auto mt-5 bg-[#8A76F3] hover:bg-[#9e8df5] text-white font-normal py-2 px-4 rounded"
                                on:click={()=>goto('./register')}>Create Now!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lg:hidden sm:block">
        <div class="h-screen flex bg-white lg:bg-base-200">
            <div class=" m-auto">
                <div class="card lg:max-w-[31rem] bg-base-100 ">
                    <div class="card-body">
                        <div class="sm:p-1 lg:p-4 w-full bg-white container ">
                            <div class="sm:block lg:hidden">
                                <div class="btn-group ">
                                    <button class="btn w-1/2  btn-active">Login</button>
                                    <button class="btn  w-1/2 whitespace-nowrap btn-primary btn-outline "
                                            on:click={()=>goto('./register')}>Create Account
                                    </button>
                                </div>
                                <p class="mt-2 text-[#717782] flex justify-center  text-sm mt-6">Sign In to your
                                    account</p>
                            </div>
                            <div class="mt-5">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="title-font">Last Name</span>
                                    </label>
                                    <input type="text" bind:value={email} placeholder="Please enter your last name"
                                           class={`input input-bordered w-full max-w-s ${email===''?'input'+errorClass:''}`}/>
                                </div>
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="title-font">Account Number</span>
                                    </label>
                                    <input type="text" bind:value={name} placeholder="C-XXX-00-00000"
                                           class={`input input-bordered w-full max-w-s ${name===''?'input'+errorClass:''}`}/>
                                </div>
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="title-font">Password</span>
                                    </label>
                                    <input type="password" bind:value={password}
                                           placeholder="Please enter your password"
                                           class={`input input-bordered w-full max-w-s ${password===''?'input'+errorClass:''}`}/>
                                </div>
                                <a href="/userverify" class=" btn-link underline flex justify-end mt-3">Forgot
                                    password?</a>
                            </div>
                            <button disabled={btnDisable}
                                    class={`btn btn-primary w-full mt-10 ${btnLoading?'loading':''}`}
                                    on:click={()=>handleLogin()}>Login
                            </button>
                            <p class="mt-16 text-[#717782] flex  text-sm  mt-6">Having problems signing in? - <a
                                    href="https://tarefinancial.com/contact" class="btn-link underline">Contact Us</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
