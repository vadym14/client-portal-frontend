<script>
    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'Washington, D.C.', 'West Virginia', 'Wisconsin', 'Wyoming'];
    let jsonData = {
        'customer': {
            'doctype': '',
            'name': '',
            'customer_name': '',
            'customer_primary_address': '',
            'customer_primary_contact': ''
        },
        'contact': {
            'doctype': '',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email_id': '',
            'phone': ''
        },
        'address': {
            'doctype': '',
            'name': '',
            'address_line1': '',
            'city': '',
            'state': '',
            'email_id': '',
            'phone': '',
            'pincode': ''
        },
        'user': {
            'doctype': '',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email': '',
            'new_password': ''
        },
        "project": {
            'doctype': "",
            'name': '',
            'original_creditor': '',
            'creditor_account_number': '',
            'account_open': '',
            'charge_off_date': '',
            'unadjusted_amount': '',
        },
        "register": {
            'name': '',
            'date_of_birth': '',
            'ssn': '',
        }
    };
    const handleProfileContactEdit = () => {
    }
    const handleDisableAutoPay = () => {
    }
    const handleAutoPayEdit = () => {
    };
</script>

<section class="lg:m-4 bg-base-200">
    <div class="flex lg:flex-row flex-col gap-4">
        <div class="basis-1/2 bg-white p-4">
            <h1 class="text-center text-lg sm:text-center font-semibold">Contact Information</h1>
            <div class="form-control w-full max-w-xl">
                <label class="label">
                    <span class="label-text">Full Name</span>
                </label>
                <input type="text" placeholder="Jhon Smith" bind:value={jsonData.customer.customer_name} class="input input-bordered" />
            </div>
            <div class="flex lg:flex-row sm:flex-col gap-2 max-w-xl">
                <div class="lg:basis-1/2 sm:basis-1">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">First Name</span>
                        </label>
                        <input type="text" placeholder="New York" bind:value={jsonData.contact.first_name} class="input input-bordered w-full max-w-s"/>
                    </div>
                </div>
                <div class="lg:basis-1/2 sm:basis-1">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">Last Name</span>
                        </label>
                        <input type="text" placeholder="New York" bind:value={jsonData.contact.last_name} class="input input-bordered w-full max-w-s"/>
                    </div>
                </div>
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Email</span>
                </label>
                <input type="text" placeholder="Jhon@example.com" bind:value={jsonData.address.email_id} class="input input-bordered" />
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Phone Number</span>
                </label>
                <input type="text" placeholder="646-100-1000" bind:value={jsonData.address.phone} class="input input-bordered" />
            </div>
            <div class="form-control w-full max-w-xl">
                <label class="label ">
                    <span class="label-text">Street</span>
                </label>
                <input type="text" placeholder="123 fake street" bind:value={jsonData.address.address_line1} class="input input-bordered" />
            </div>
            <div class="flex flex-row gap-2">
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">City</span>
                        </label>
                        <input type="text" placeholder="New York" bind:value={jsonData.address.city} class="input input-bordered w-full max-w-s"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
                <div class="basis-4/12">
                    <div class="form-control w-full max-w-s">
                        <label class="label">
                            <span class="text-base font-medium text-gray-900 mb-1">State</span>
                        </label>
                        <select class="select select-bordered" bind:value={jsonData.address.state}>
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
                        <input type="text" placeholder="10001" bind:value={jsonData.address.pincode} class="input input-bordered w-full max-w-s"/>
                        <label class="label">
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-control w-full">
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
            <div class="flex lg:flex-row gap-2 flex-col lg:mt-52 sm:mt-4">
                <div class="lg:basis-1/2">
                    <button class="btn btn-active w-full btn-primary btn-wide" on:click={()=>handleDisableAutoPay()}>DISABLE AUTOPAY </button>
                </div>
                <div class="lg:basis-1/2">
                    <button class="btn btn-primary w-full btn-outline btn-wide" on:click={()=>handleAutoPayEdit()}>EDIT</button>
                </div>
            </div>
        </div>
    </div>

</section>

