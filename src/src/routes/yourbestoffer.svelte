<script>
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {api} from "../lib/_api";
let offerData
    const cardd=[1,2,3,4,5]
    onMount(async () =>{
        const request = new Request(`http://192.168.100.229:8002/api/resource/Payment%20Term`, {method: 'GET'});
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong on API server!');
                }
            })
            .then(response => {
                console.debug(response);
                // ...
            }).catch(error => {
            console.error(error);
        });

        // const response = await api('GET', `resource/Payment%20Term`);
       /* // const response = await api('GET', `resource/Payment%20Term`);
        if(response.status===200){
            offerData =await response.json();
            console.log(offerData,"Offer dta")
        }else {
            console.log('error',response);
            //notifications.danger('Something wrong', 2000)
        }*/
    })
    const handleSave = () =>{
        goto('/docusign')
    }

    const handleSelectOffer = () =>{

    }

</script>
<section class="h-screen flex">
    <div class="m-auto">
        <div class="card">
            <div class="sm:p-3 lg:p-10 bg-white container ">
                <div class="border-solid border rounded-md p-2">
                    <div class="sm:p-2 lg:p-6 w-full">
                        <h1 class="text-lg font-semibold mb-4 text-center lg:text-left">Account Information</h1>
                        <div class="flex lg:flex-row flex-col">
                            <div class="basis-1/2">
                                <div class="flex justify-between sm:text-sm lg:text-base">Name: <span class="text-[#717782]">John Smith</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">DOB: <span class="text-[#717782]">01/01/2019</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">SSN: <span class="text-[#717782]">John Smith</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">Phone Number: <span class="text-[#717782]">John Smith</span></div>
                                <div class="flex justify-between sm:text-sm lg:text-base">Address: <span class="text-[#717782]">123 Fake Street, 10001</span></div>
                            </div>
                            <div class="divider lg:divider-horizontal divider-vertical"></div>
                            <div class="basis-1/2">
                                <div class="flex justify-between">Creditor: <span class="text-[#717782]">XYZ Bank, Inc.</span></div>
                                <div class="flex justify-between">Creditor Account: <span class="text-[#717782]">1234567890</span></div>
                                <div class="flex justify-between">Opening Date: <span class="text-[#717782]">01/01/2019</span></div>
                                <div class="flex justify-between">Chargeoff Date: <span class="text-[#717782]">01/01/2019</span></div>
                                <div class="flex justify-between">Chargeoff Amount: <span class="text-[#717782]">$22,675.00</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-2xl sm:mt-4 lg:mt-10 mb-6 font-medium">Let’s review your offers</div>

                    <div class="flex sm:overflow-scroll xl:overflow-hidden gap-2">
                        {#each cardd as items,index}
                            <div key={index} class="w-60 h-80 border hover:border-primary rounded p-5 flex flex-col ">
                                <h2 class="text-center text-lg font-bold">Your best offer</h2>
                                <div class="max-w-52 p-3 bg-gray-100 rounded align-center">
                                    <h2 class="text-lg text-blue-500 text-center font-semibold text-primary">$12471.25</h2>
                                    <span class="text-center flex justify-center line-through  text-sm">$22675.00</span>
                                </div>
                                <h2 class="text-center text-lg font-semibold text-[#FB896B] mt-4">45% forgiven</h2>
                                <h2 class="text-center text-sm font-medium mt-3 px-4">Make payment within 1 week</h2>
                                <button class="btn btn-outline btn-primary w-52 mt-10 " on:click={()=>{handleSelectOffer()}}>Select</button>
                            </div>
                        {/each}
                    </div>
                    <div class="flex lg:flex-row flex-col-reverse lg:justify-end sm:justify-center gap-2 mt-10">
                            <div class="lg:block sm:hidden">
                                <button class="btn lg:btn-wide sm:w-full btn-outline btn-primary">
                                    FAQ
                                </button>
                            </div>
                            <div class="sm:block lg:hidden">
                                <div class="flex justify-end">
                                <svg class="fill-primary stroke-white" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_5_980)">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9.09009 8.99999C9.32519 8.33166 9.78924 7.7681 10.4 7.40912C11.0108 7.05015 11.729 6.91893 12.4273 7.0387C13.1255 7.15848 13.7589 7.52151 14.2152 8.06352C14.6714 8.60552 14.9211 9.29151 14.9201 9.99999C14.9201 12 11.9201 13 11.9201 13"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 17H12.01"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </g>
                                </svg>
                                </div>
                            </div>
                        <div>
                            <button class="btn lg:btn-wide sm:w-full btn-outline btn-primary" >Contact Us</button>
                        </div>
                        <div>
                            <button class="btn lg:btn-wide sm:w-full btn-primary" on:click={()=>{handleSave()}}>Save & Exit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>