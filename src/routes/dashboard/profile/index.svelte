<script>
    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = {
        fullName : '',
        email : '',
        phoneNumber : '',
        mobile : '',
        street : '',
        contactCity : '',
        contactState : '',
        contactCode : '',
        cardNumber : '',
        bankAccount : '',
        bankRoutingNumber : '',
        autoPayCity : '',
        autoPayState : '',
        autoPayCode : '',
    }
    const handleProfileContactEdit = () => {
    }
    const handleDisableAutoPay = () => {
    }
    const handleAutoPayEdit = () => {
    };
</script>

<section class="m-4 ">
    <div class="flex lg:flex-row flex-col gap-4">
        <div class="basis-1/2 bg-white p-4">
            <h1 class="text-center text-lg sm:text-center font-semibold">Contact Information</h1>
            <div class="form-control w-full max-w-xl">
                <label class="label">
                    <span class="label-text">Full Name</span>
                </label>
                <input type="text" placeholder="Jhon Smith" bind:value={jsonData.fullName} class="input input-bordered" />
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Email</span>
                </label>
                <input type="text" placeholder="Jhon@example.com" bind:value={jsonData.email} class="input input-bordered" />
            </div>
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">Phone Number</span>
                </label>
                <div class="flex gap-5">
                    <div class="basis-3/5 w-full">
                        <input type="text" placeholder="646-100-1000" bind:value={jsonData.phoneNumber} class="input input-bordered w-full max-w-lg"/>
                    </div>
                    <div class="basis-2/5 max-w-xs">
                        <select class="select select-bordered max-w-xs" bind:value={jsonData.mobile}>
                            <option value="Mobile">Mobile</option>
                            <option value="Home Landline">Home Landline</option>
                            <option value="Work Landline">Work Landline</option>
                        </select>
                    </div>
                </div>
                <div class="form-control w-full max-w-xl">
                    <label class="label ">
                        <span class="label-text">Street</span>
                    </label>
                    <input type="text" placeholder="123 fake street" bind:value={jsonData.street} class="input input-bordered" />
                </div>
                <div class="flex flex-row gap-2">
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">City</span>
                            </label>
                            <input type="text" placeholder="New York" bind:value={jsonData.contactCity} class="input input-bordered w-full max-w-s"/>
                            <label class="label">
                            </label>
                        </div>
                    </div>
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">State</span>
                            </label>
                            <select class="select select-bordered" bind:value={jsonData.contactState}>
                                <option disabled selected>Select</option>
                                {#each states as state}
                                    <option>{state}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">Code</span>
                            </label>
                            <input type="text" placeholder="10001" bind:value={jsonData.contactCode} class="input input-bordered w-full max-w-s"/>
                            <label class="label">
                            </label>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <button class="btn btn-outline btn-primary btn-wide" on:click={()=>handleProfileContactEdit()}>EDIT</button>
                </div>
        </div>
    </div>
        <div class="basis-1/2 bg-white p-4">
            <h1 class="text-center text-lg sm:text-center font-semibold">Autopay Setting</h1>
            <div class="form-control xl:w-full max-w-sm">
                <label class="label">
                    <span class="label-text">Card Number</span>
                </label>
                <input type="text" placeholder="**** **** **** 1234" bind:value={jsonData.cardNumber} class="input input-bordered" />
            </div>
            <div class="flex flex-row gap-2">
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">City</span>
                        </label>
                        <input type="text" placeholder="New York" bind:value={jsonData.autoPayCity} class="input input-bordered w-full max-w-s"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">State</span>
                        </label>
                        <select class="select select-bordered" bind:value={jsonData.autoPayState}>
                            <option disabled selected>Select</option>
                            {#each states as state}
                                <option>{state}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">Code</span>
                        </label>
                        <input type="text" placeholder="10001" bind:value={jsonData.autoPayCode} class="input input-bordered w-full max-w-s"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Bank Account</span>
                </label>
                <input type="text" placeholder="Bank Account" bind:value={jsonData.bankAccount} class="input input-bordered" />
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Bank Routing Number</span>
                </label>
                <input type="text" placeholder="Bank Routing Number" bind:value={jsonData.bankRoutingNumber} class="input input-bordered" />
            </div>
            <div class="flex lg:flex-row gap-2 flex-col mt-24">
                <div class="flex lg:basis-1/2">
                    <button class="btn btn-active w-full btn-primary btn-wide" on:click={()=>handleDisableAutoPay()}>DISABLE AUTOPAY </button>
                </div>
                <div class="flex lg:basis-1/2">
                    <button class="btn btn-primary w-full btn-outline btn-wide" on:click={()=>handleAutoPayEdit()}>EDIT</button>
                </div>

            </div>
        </div>
    </div>

</section>

