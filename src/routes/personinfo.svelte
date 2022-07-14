<script lang="ts">
    import {goto} from "$app/navigation";
    import {registerData} from "../lib/store/registerStore.ts";
    import {onMount} from "svelte";
    import {api} from "../lib/_api";

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = {
        customer_name: '', email_id: '', phone: '', phone_type: '',customer_primary_contact: '',
        address_line1: '', city: '', state: '', pincode: '', first_name: '', last_name: '',customer_primary_address: '',
    };
    let errorClass = '';
    let previousData ={name: undefined, ssn: undefined};
    // onMount(()=>{
    //     previousData = {...$registerData};
    //     if(previousData==={} || previousData.acc_name===undefined || previousData.ssn===undefined){
    //         goto('/register');
    //     }
    // })
    onMount(async () => {
        if ($registerData !== {}) {
            jsonData = {...$registerData};
        }
        const response = await api('post', `onboarding/personInfo`, {"name": $registerData.name});
        if (response.status === 200) {
            const data=await response.json();
            jsonData={...data.response.customer[0],...data.response.address[0],...data.response.contact[0],...$registerData};
            //$registerData = jsonData;
            //await goto('/createpassword');
        } else {
            console.log('error', response);
            //notifications.danger('Something wrong', 2000)
        }
    });
    const handleSave = () => {
        if (jsonData.customer_name === '' || jsonData.email_id === '' || jsonData.phone === '' || jsonData.phone_type === '' ||
            jsonData.address_line1 === '' || jsonData.city === '' || jsonData.state === '' || jsonData.pincode === '') {
            errorClass = '-error';
        } else {
            $registerData={...jsonData};
            goto('/yourbestoffer')
        }
    }
    const handleEdit = () =>{
    };
    $:console.log('data1=',jsonData)
</script>
<div class="h-screen flex sm:bg-white lg:bg-base-200">
    <div class="m-auto">
        <div class="card lg:max-w-[60rem] bg-white mt-4 flex">
            <div class="card-body">
                <div class="flex flex-col">
                    <h1 class="sm:text-2xl lg:text-4xl font-semibold">Person Info</h1>
                    <p class="mt-2 sm:text-sm lg:text-base">We’ve located your account. Please review and confirm your
                        contact information:</p>
                </div>
                <div class=" flex grid grid-cols-2 gap-2">
                    <div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">Full Name</span>
                            </label>
                            <input type="text" placeholder="John Smith" bind:value={jsonData.customer_name}
                                   class={`input input-bordered w-full max-w-s ${jsonData.customer_name===''?('input'+errorClass):''}`}/>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 ">Street</span>
                            </label>
                            <input type="text" placeholder="123 Fake Street" bind:value={jsonData.address_line1}
                                   class={`input input-bordered w-full max-w-s ${jsonData.address_line1===''?('input'+errorClass):''}`}/>
                        </div>
                        <div class="flex flex-row gap-2">
                            <div class="basis-4/12">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="text-base font-medium text-gray-900 ">City</span>
                                    </label>
                                    <input type="text" placeholder="New York" bind:value={jsonData.city}
                                           class={`input input-bordered w-full max-w-s ${jsonData.city===''?('input'+errorClass):''}`}/>
                                </div>
                            </div>
                            <div class="basis-4/12">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="text-base font-medium text-gray-900 ">State</span>
                                    </label>
                                    <select class={`select select-bordered ${jsonData.state===''?('select'+errorClass):''}`}
                                            bind:value={jsonData.state}>
                                        <option value="" disabled selected>Select</option>
                                        {#each states as state}
                                            <option value={state}>{state}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>

                            <div class="basis-4/12">
                                <div class="form-control w-full max-w-s">
                                    <label class="label">
                                        <span class="text-base font-medium text-gray-900 ">Code</span>
                                    </label>
                                    <input type="text" placeholder="10001" bind:value={jsonData.pincode}
                                           class={`input input-bordered w-full max-w-s ${jsonData.pincode===''?('input'+errorClass):''}`}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">First Name</span>
                            </label>
                            <input type="text" placeholder="John Smith" bind:value={jsonData.first_name}
                                   class={`input input-bordered w-full max-w-s ${jsonData.first_name===''?('input'+errorClass):''}`}/>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">Last Name</span>
                            </label>
                            <input type="text" placeholder="John Smith" bind:value={jsonData.last_name}
                                   class={`input input-bordered w-full max-w-s ${jsonData.last_name===''?('input'+errorClass):''}`}/>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 ">Phone number</span>
                            </label>
                            <div class="flex flex-row gap-2">
                                <div class="basis-3/4">
                                    <input type="text" placeholder="646-100-1000" bind:value={jsonData.phone}
                                           class={`input input-bordered w-full max-w-s ${jsonData.phone===''?('input'+errorClass):''}`}/>
                                </div>
                                <div class="form-control w-full max-w-s basis-1/4">
                                    <select class={`select select-bordered ${jsonData.phone_type===''?('select'+errorClass):''}`}
                                            bind:value={jsonData.phone_type}>
                                        <option value="" disabled selected>Select</option>
                                        <option value="Mobile">Mobile</option>
                                        <option value="Home Landline">Home Landline</option>
                                        <option value="Work Landline">Work Landline</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900">Email</span>
                            </label>
                            <input type="text" placeholder="john@gmail.com" bind:value={jsonData.email_id}
                                   class={`input input-bordered w-full max-w-s ${jsonData.email_id===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                </div>
                <div class="flex  w-full gap-2 sm:flex-wrap lg:flex-nowrap flex-col lg:flex-row mt-4 sm:flex-col-reverse">
                    <div class="basis-1/2">
                        <button class="btn w-full btn-wide btn-outline btn-primary" on:click={()=>handleEdit()}>Edit
                        </button>
                    </div>
                    <div class="basis-1/2">
                        <button class="btn w-full btn-wide btn-active btn-primary" on:click={()=>handleSave()}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
