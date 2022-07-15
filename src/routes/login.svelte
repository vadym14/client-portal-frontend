<script lang="ts">
    // import type { CustomError } from '$lib/interfaces/error.interface';
    import { api } from '../lib/_api.ts';
    import {userData1}  from '../lib/store/userStore.js';
    import {variables} from "../lib/utils/constants";
    import {notificationData} from "../lib/store/notificationStore";
    import { goto } from "$app/navigation";

    let email = '', name = '', password = '', errorClass='',btnDisable=false,
        btnLoading=false;
        // errors: Array<CustomError>;
    const handleLogin=async () => {
        $userData1 = {
            email: email,
            name: name,
            password: password
        };
        goto('/dashboard')
        btnDisable = true;
        btnLoading = true;
        if (email === '' || name === '' || password === '') {
            errorClass = '-error';
            btnDisable = false;
            btnLoading = false;
        }else {
            const jsonData={
                lastname: email,
                usr:name,
                pwd:password
            }
            const response = await api('POST', `method/login`,jsonData);
            if(response.status===200){
                notificationData.update(() => 'Login successful...');
                const data=await response.json();
                userData1.set(data);
                // $userInfo = {...rjson.data}
                await goto('/dashboard');
            }else {
                console.log('error',response);
                //notifications.danger('Something wrong', 2000)
                btnDisable = false;
                btnLoading = false;
            }
        }
    }
</script>

<section class="">
    <div class="sm:hidden lg:block">
        <div class="flex h-screen  text-gray-600 bg-base-300  body-font ">
            <div class="m-auto flex flex-row  w-[53rem] card ">
                <div class="p-4 w-full bg-white container p-6 ">
                    <h1 class="title-font  text-blackhead text-3xl font-bold">Login</h1>
                    <p class="mt-2 text-grey">Sign In to your account</p>
                    <div class=" mt-5">
                        <div class="form-control w-96 max-w-sm">
                            <label class="label">
                                <span class="title-font">Last Name</span>
                            </label>
                            <input type="text" bind:value={email} placeholder="Please enter your last name"
                                   class={`input input-bordered w-full max-w-s ${email===''? 'input'+errorClass:''}`} />
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font font-medium text-gray-900">Account Number</span>
                            </label>
                            <input type="text" bind:value={name} placeholder="C-XXX-00-00000"
                                   class={`input input-bordered w-full max-w-s ${name===''?'input'+errorClass:''}`} />
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="title-font font-medium text-gray-900">Password</span>
                            </label>
                            <input type="password" bind:value={password} placeholder="Please enter your password"
                                   class={`input input-bordered w-full max-w-s ${password===''?'input'+errorClass:''}`} />
                        </div>
                    </div>
                    <div class="flex flex-row justify-between my-5">
                        <button disabled={btnDisable} class={`btn btn-primary ${btnLoading?'loading':''}`}  on:click={()=>handleLogin()}>Login</button>
                        <a href="#" class="btn btn-link underline ">Forgot password?</a>
                    </div>
                    <hr class="text-gray-200"/>
                    <div class="mt-6 text-center">
                        <p class="text-grey">Having problems signing in? - <a href="https://tarefinancial.com/contact" class="btn-link underline">Contact Us</a></p>
                    </div>
                </div>
                <div class="bg-[#7661E2] w-full flex flex-col">
                    <div class="m-auto">
                        <h1 class="text-white text-4xl font-semibold whitespace-nowrap">Create Account</h1>
                        <button class=" flex mx-auto mt-5 bg-[#8A76F3] hover:bg-[#9e8df5] text-white font-normal py-2 px-4 rounded" on:click={()=>goto('./register')}>Create Now!</button>

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lg:hidden sm:block" >
        <div class="h-screen flex bg-white lg:bg-base-200">
            <div class=" m-auto">
                <div class="card lg:max-w-[31rem] bg-base-100 ">
                    <div class="card-body">
                        <div class="sm:p-1 lg:p-4 w-full bg-white container ">
                            <div class="sm:block lg:hidden">
                                <div class="btn-group ">
                                    <button class="btn w-1/2  btn-active">Login</button>
                                    <button class="btn  w-1/2 whitespace-nowrap btn-primary btn-outline "  on:click={()=>goto('./register')} >Create Account</button>
                                </div>
                                <p class="mt-2 text-[#717782] flex justify-center  text-sm mt-6">Sign In to your account</p>
                            </div>
                            <div class="mt-5">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="title-font">Last Name</span>
                                    </label>
                                    <input type="text" bind:value={email} placeholder="Please enter your last name"
                                           class={`input input-bordered w-full max-w-s ${email===''?'input'+errorClass:''}`} />
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
                                    <input type="password" bind:value={password} placeholder="Please enter your password"
                                           class={`input input-bordered w-full max-w-s ${password===''?'input'+errorClass:''}`}/>
                                </div>
                                <a href="#" class=" btn-link underline flex justify-end mt-3">Forgot password?</a>

                            </div>
                            <button disabled={btnDisable} class={`btn btn-primary w-full mt-10 ${btnLoading?'loading':''}`} on:click={()=>handleLogin()}>Login</button>

                            <p class="mt-16 text-[#717782] flex  text-sm  mt-6">Having problems signing in? - <a href="https://tarefinancial.com/contact" class="btn-link underline">Contact Us</a></p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
