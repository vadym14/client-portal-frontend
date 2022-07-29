<script lang="ts">
    import {api} from "$lib/_api";
    import LoaderPage from "../../lib/LoaderPage.svelte";
    import {DasboardInfo} from "../../lib/store/dashboardinfoStore.ts";
    import {goto} from "$app/navigation";

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
        'plan': {
            'doctype': '',
            'name': '',
            'settlement_amount': '',
            'forgiven_percentage': '',
            'total_terms': '',
            'docusign_template': '',
            'credit_duration': '',
            'terms': [],
        }
    };
    const items = [1, 2, 3, 4, 5, 6];
    // const getData = async () => {
    //     const response = await api('get', `portal/dashboard-data`);
    //     const data=await response.json()
    //     $DasboardInfo={...data.data}
    //     jsonData={...data.data};
    //     if(data.data.envelope.envelope_status!=='signed'){
    //         await goto('/yourbestoffer')
    //     }
    // }
    let promise = $DasboardInfo; let remaining_amount=0; let total_payed=0;
    let final_date=new Date()
    jsonData = {...$DasboardInfo};
    const addDays=(days=0)=>{
        let date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString("en-US");
    }
    const getAmount=(total,portion,discount)=>{
        let remainingAmount =0;
        remainingAmount =total / 100 * portion
        remainingAmount =remainingAmount - (remainingAmount * discount / 100)
        remaining_amount+=remainingAmount;
        return remainingAmount;
    }
    const finalDate=()=>{
        const lastElement= jsonData?.plan['terms']?.slice(-1);
        return addDays(lastElement[0]['credit_days']);
    }
</script>
<svelte:head>
    <title>Home</title>
</svelte:head>
<section class="p-4">
    {#await promise}
        <LoaderPage/>
    {:then number}
        <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <div class="bg-white">
                <div class='flex gap-4 sm:flex-wrap xl:flex-nowrap p-6'>
                    <div class="p-6 bg-[#ECEAFE] rounded basis-full flex-shrink">
                        <h2 class="text-4xl text-[#7661E2]">${jsonData.plan.settlement_amount}</h2>
                        {#if (parseInt(jsonData?.plan.settlement_amount) !== parseInt(jsonData?.project?.unadjusted_amount))}
                            <p class="text-base mt-3 line-through v">${jsonData?.project?.unadjusted_amount}</p>
                        {/if}
                    </div>
                    <div class="p-6 bg-[#FFF0E6] rounded basis-full flex-shrink">
                        <h2 class="text-4xl text-[#FB896B]">{jsonData?.plan.forgiven_percentage}% discount</h2>
                        <p class="text-base mt-3 text-[#717782]">{jsonData?.plan.credit_duration}</p>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="m-4">
                    <h1 class='ml-2 mb-2 text-lg font-semibold text-center lg:text-left'>Account Details</h1>
                    <div class="mx-4">
                        <table class="table table-compact w-full bg-white text-sm">
                            <tbody>
                            <tr>
                                <td>Creditor:</td>
                                <td class="t-color">{jsonData?.project.original_creditor}</td>
                            </tr>
                            <tr>
                                <td>Creditor Account:</td>
                                <td class="t-color">{jsonData?.project.creditor_account_number}</td>
                            </tr>
                            <tr>
                                <td>Opening Date:</td>
                                <td class="t-color">{jsonData?.project.account_open}</td>
                            </tr>
                            <tr>
                                <td>Chargeoff Date:</td>
                                <td class="t-color">{jsonData?.project.charge_off_date}</td>
                            </tr>
                            <tr>
                                <td>Chargeoff Amount:</td>
                                <td class="t-color">{jsonData?.project.unadjusted_amount}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="bg-white">
                <div class='m-4'>
                    <h1 class='text-lg mb-2 font-semibold text-center lg:text-left'>Debt Summary</h1>
                    <div class="flex gap-4 sm:flex-wrap xl:flex-nowrap">
                        <div class="basis-full flex-shrink flex">
                            <div class="radial-progress circleOuter mx-auto">
                                <div class="radial-progress circleInner"></div>
                            </div>
                        </div>
                        <div class="basis-full flex-shrink flex">
                            <div class="mx-auto xl:my-auto">
                                <h1 class='text-sm text-[#717782]'>Amount Remaining:</h1>
                                <h1 class='lg:text-lg text-2xl font-semibold text-[#7661E2]'>${remaining_amount}</h1>
                                <h1 class='text-sm text-[#717782]'>Total Payments:</h1>
                                <h1 class='lg:text-lg text-2xl font-semibold text-[#FB896B]'>${total_payed}</h1>
                                <h1 class='text-sm text-[#717782]'>Final Payment Date:</h1>
                                <h1 class='lg:text-lg text-2xl font-semibold text-[#394252]'>{finalDate()}</h1>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="bg-white">
                <div class='m-4'>
                    <h1 class='ml-4 text-lg font-semibold text-center lg:text-left'>Payment History</h1>
                </div>
                <div class="mx-4">
                    <table class="table table-normal w-full text-base p-head">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each items as item,index}
                            <tr>
                                <td>04/01/2022</td>
                                <td>$2015.56</td>
                                <td style='color:#2EB85C;'>Approved</td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="bg-white">
                <div class='m-4'>
                    <h1 class='ml-4 text-lg font-semibold text-center lg:text-left'>Payment Schedule</h1>
                </div>
                <div class="mx-4">
                    <table class="table table-normal w-full text-base p-head">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each jsonData?.plan.terms.reverse() as item,index}
                            <tr key={index+item['payment_term']}>
                                <td>{addDays(item['credit_days'])}</td>
                                <td>{getAmount(jsonData?.plan['total_amount'],item['invoice_portion'],item['discount'])}</td>
                                <td class='text-green-500'>Approved</td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/await}
</section>
<style>
    .t-color {
        color: #717782;
    }

    .p-head th {
        color: #717782;
        font-size: 1rem;
    }

    .p-head td {
        color: #23262F;
        font-size: 1rem;
    }

    @media (min-width: 380px) {
        .circleOuter {
            --value: 100;
            --size: 14rem;
            --thickness: 4rem;
            color: #7661E2;
        }

        .circleInner {
            --value: 80;
            --size: 14rem;
            --thickness: 4rem;
            color: #FB896B;
        }

    }

    @media (min-width: 1280px) {
        .circleOuter {
            --value: 100;
            --size: 20rem;
            --thickness: 5rem;
            color: #7661E2;
        }

        .circleInner {
            --value: 80;
            --size: 20rem;
            --thickness: 5rem;
            color: #FB896B;
        }
    }
</style>