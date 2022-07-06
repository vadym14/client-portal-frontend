<script lang="ts">
    import {goto} from "$app/navigation";
    import {registerData} from "../lib/store/registerStore.ts";
    import {onMount} from "svelte";

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = { full_name : '', email_id : '', phone : '', phone_type : '',
        address_line1 : '', city : '', state : '', pincode : '',};
    let errorClass = '';
    let previousData ={acc_name: undefined, ssn: undefined};
    onMount(()=>{
        previousData = {...$registerData};
        if(previousData==={} || previousData.acc_name===undefined || previousData.ssn===undefined){
            goto('/register');
        }
    })
    onMount(()=>{
        if($registerData !=={}){
            jsonData = {...$registerData};
        }
    });
    const handleSave = () => {
        if (jsonData.full_name === '' || jsonData.email_id === '' || jsonData.phone === '' || jsonData.phone_type === '' ||
            jsonData.address_line1 === '' || jsonData.city === '' || jsonData.state === '' || jsonData.pincode === '') {
            errorClass = '-error';
        } else {
            $registerData={...jsonData};
            goto('/yourbestoffer')
        }
    }
    const handleEdit = () =>{
    };
    console.log('data1=',$registerData)
</script>

<div class="h-screen flex sm:bg-white lg:bg-base-200">
    <div class="m-auto">
        <div class="card lg:max-w-[31rem] bg-white mt-4 flex">
            <div class="card-body">
                <div class="flex flex-col">
                    <h1 class="sm:text-2xl lg:text-4xl font-semibold">Person Info</h1>
                    <p class="mt-2 sm:text-sm lg:text-base">We’ve located your account. Please review and confirm your contact information:</p>
                </div>
                <div class="sm:text-lg sm:block lg:hidden font-semibold  text-center mt-9 mb-2">Contact Information</div>

                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900">Full Name</span>
                    </label>
                    <input type="text" placeholder="John Smith" bind:value={jsonData.full_name}
                           class={`input input-bordered w-full max-w-s ${jsonData.full_name===''?('input'+errorClass):''}`}/>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900">Email</span>
                    </label>
                    <input type="text" placeholder="john@gmail.com" bind:value={jsonData.email_id}
                           class={`input input-bordered w-full max-w-s ${jsonData.email_id===''?('input'+errorClass):''}`} />

                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900 mb-1">Phone number</span>
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
                        <span class="text-base font-medium text-gray-900 mb-1">Street</span>
                    </label>
                    <input type="text" placeholder="123 Fake Street" bind:value={jsonData.address_line1}
                           class={`input input-bordered w-full max-w-s ${jsonData.address_line1===''?('input'+errorClass):''}`} />
                </div>
                <div class="flex flex-row gap-2">
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">City</span>
                            </label>
                            <input type="text" placeholder="New York" bind:value={jsonData.city}
                                   class={`input input-bordered w-full max-w-s ${jsonData.city===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">State</span>
                            </label>
                            <select class={`select select-bordered ${jsonData.state===''?('select'+errorClass):''}`} bind:value={jsonData.state}>
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
                                <span class="text-base font-medium text-gray-900 mb-1">Code</span>
                            </label>
                            <input type="text" placeholder="10001" bind:value={jsonData.pincode}
                                   class={`input input-bordered w-full max-w-s ${jsonData.pincode===''?('input'+errorClass):''}`}/>
                        </div>
                    </div>
                </div>
                <div class="flex  w-full gap-2 sm:flex-wrap lg:flex-nowrap flex-col lg:flex-row mt-4 sm:flex-col-reverse">
                    <div class="basis-1/2">
                        <button class="btn w-full btn-wide btn-outline btn-primary" on:click={()=>handleEdit()}>Edit</button>
                    </div>
                    <div class="basis-1/2">
                        <button class="btn w-full btn-wide btn-active btn-primary" on:click={()=>handleSave()}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>