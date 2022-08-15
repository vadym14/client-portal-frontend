<script lang="ts">
    import {DasboardInfo} from "../../lib/store/dashboardinfoStore.ts";
    import {goto} from "$app/navigation";
    import {paymentStripe} from "$lib/store/paymentStore";

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
        },
        'paymentSchedule': [],
        'baseTotal': 0,
        'paymentHistory': [],
    };

    let innerValue = 0;
    let total_payed = 0;
    jsonData = {...$DasboardInfo};
    const finalDate = () => {
        const lastElement = jsonData?.paymentSchedule?.slice(0, 1);
        if (lastElement[0] === undefined || lastElement === undefined || lastElement.length === 0) {
            return '';
        } else {
            return lastElement[0]['due_date'];
        }
    }
    const getRemainingAmount = () => {
        let remainingAmount = 0;
        let paidAmount = 0;
        jsonData?.paymentSchedule?.forEach((element, index) => {
            const discount = element.discount ? (element.payment_amount * element.discount) / 100 : 0;
            element.discount_amount = discount;
            //set remaining amount and status
            if (element['paid_amount'] !== (element['payment_amount'] - discount)) {
                remainingAmount += element.payment_amount - discount;
                if (jsonData?.paymentSchedule.length - 1 - (jsonData?.paymentHistory.length) === index) {
                    element.status = 2;
                } else {
                    element.status = 1;
                }
            }
            //set paid amount
            jsonData?.paymentHistory?.forEach((element1) => {
                    if (element1['termName'] === element['payment_term']) {
                        paidAmount += element1['paid_amount'];
                        element.status = 3
                    }
                }
            );
        });
        total_payed = paidAmount;
        innerValue = (total_payed / (total_payed + remainingAmount)) * 100;
        return remainingAmount - paidAmount;
    }
    const handlePayment = (amount, discount, name, date) => {
        $paymentStripe = {
            'amount': (amount - discount).toFixed(2),
            'termName': name,
            'dueDate': date,
            'discountAmount': discount.toFixed(2),
        }
        goto('/dashboard/payment');
    }
</script>
<svelte:head>
    <title>Home</title>
</svelte:head>

<section class="p-4">

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
                        {#if innerValue === 100}
                            <div class="radial-progress circleInner" style="--value: {innerValue};"></div>
                        {:else}
                            <div class="radial-progress circleOuter mx-auto">
                                <div class="radial-progress circleInner" style="--value: {innerValue};"></div>
                            </div>
                        {/if}
                    </div>
                    <div class="basis-full flex-shrink flex">
                        <div class="mx-auto xl:my-auto">
                            <h1 class='text-sm text-[#717782]'>Amount Remaining:</h1>
                            <h1 class='lg:text-lg text-2xl font-semibold text-[#7661E2]'>
                                ${jsonData.paymentSchedule.length === 0 ? 0.00 : getRemainingAmount().toFixed(2)}</h1>
                            <h1 class='text-sm text-[#717782]'>Total Payments:</h1>
                            <h1 class='lg:text-lg text-2xl font-semibold text-[#FB896B]'>${total_payed.toFixed(2)}</h1>
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
                    {#if jsonData['paymentHistory']?.length > 0 || jsonData['paymentHistory'] !== undefined}
                        {#each jsonData?.paymentHistory as item,index}
                            <tr key={index}>
                                <td>{item.posting_date}</td>
                                <td>${item.paid_amount.toFixed(2)}</td>
                                <td class="uppercase">
                                    <span class="text-[#2EB85C]">Approved</span>
                                </td>
                            </tr>
                        {/each}
                    {/if}
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
                    {#if jsonData['paymentSchedule'].length > 0 || jsonData['paymentSchedule'] !== undefined}
                        {#each jsonData['paymentSchedule'] as item,index}
                            <tr key={index}>
                                <td>{item['due_date']}</td>
                                <td>{(item['payment_amount'] - item['discount_amount']).toFixed((2))}</td>
                                <td>
                                    {#if item['status'] === 1}
                                        <span class='text-[#F4B267] uppercase'>Upcoming</span>
                                    {:else if item['status'] === 2}
                                        <button class="btn  w-1/2 whitespace-nowrap btn-primary btn-outline "
                                                on:click={()=>handlePayment(item['payment_amount'],item['discount_amount'],item['payment_term'],item['due_date'])}>
                                            Pay Now
                                        </button>
                                    {:else if item['status'] === 3}
                                        <span class='text-[#2EB85C] uppercase'>Paid</span>
                                    {:else}
                                        <span class='text-[#F56565]'>Unknown</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

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
        }

        .circleInner {
            --size: 20rem;
            --thickness: 5rem;
        }
    }
</style>
