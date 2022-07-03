<script>
    let jsonData = {
        fullName : '',
        email : '',
        phoneNumber : '',
        mobile : '',
        street : '',
        city : '',
        state : '',
        code : ''
    };
    const handleSave = () => {
    }
    const handleEdit = () =>{
    };
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
                    <input type="text" placeholder="John Smith" bind:value={jsonData.fullName} class="input input-bordered w-full max-w-s"/>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900">Email</span>
                    </label>
                    <input type="text" placeholder="john@gmail.com" bind:value={jsonData.email} class="input input-bordered w-full max-w-s"/>

                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900 mb-1">Phone number</span>
                    </label>
                    <div class="flex flex-row gap-2">
                        <div class="basis-3/4">
                            <input type="text" placeholder="646-100-1000" bind:value={jsonData.phoneNumber} class="input input-bordered w-full max-w-s"/>
                        </div>
                        <div class="form-control w-full max-w-s basis-1/4">
                            <select class="select select-bordered" bind:value={jsonData.mobile}>
                                <option disabled selected>Mobile</option>
                                <option>Star Wars</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-control w-full max-w-s">
                    <label class="label">
                        <span class="text-base font-medium text-gray-900 mb-1">Street</span>
                    </label>
                    <input type="text" placeholder="123 Fake Street" bind:value={jsonData.street} class="input input-bordered w-full max-w-s"/>
                </div>
                <div class="flex flex-row gap-2">
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">City</span>
                            </label>
                            <input type="text" placeholder="New York" bind:value={jsonData.city} class="input input-bordered w-full max-w-s"/>
                        </div>
                    </div>
                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">State</span>
                            </label>
                            <select class="select select-bordered" bind:value={jsonData.state}>
                                <option disabled selected>Select</option>
                                <option>NY</option>
                            </select>
                        </div>
                    </div>

                    <div class="basis-4/12">
                        <div class="form-control w-full max-w-s">
                            <label class="label">
                                <span class="text-base font-medium text-gray-900 mb-1">Code</span>
                            </label>
                            <input type="text" placeholder="10001" bind:value={jsonData.code} class="input input-bordered w-full max-w-s"/>
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