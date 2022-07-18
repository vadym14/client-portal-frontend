<script>
	const items=[1,2,3,4,5,6];
</script>
<svelte:head>
	<title>Home</title>
</svelte:head>
<section class="p-4">
	<div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
		<div class="bg-white">
			<div class='flex gap-4 sm:flex-wrap xl:flex-nowrap p-6'>
				<div class="p-6 bg-[#ECEAFE] rounded basis-full flex-shrink">
					<h2 class="text-4xl text-[#7661E2]">$12471.25</h2>
					<p class="text-base mt-3 line-through v">$22675.00</p>
				</div>
				<div class="p-6 bg-[#FFF0E6] rounded basis-full flex-shrink">
					<h2 class="text-4xl text-[#FB896B]">45% discount</h2>
					<p class="text-base mt-3 text-[#717782]">Make payment within 1 week</p>
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
							<td class="t-color">original_creditor</td>
						</tr>
						<tr>
							<td>Creditor Account:</td>
							<td class="t-color">creditor_account_number</td>
						</tr>
						<tr>
							<td>Opening Date:</td>
							<td class="t-color">account_open</td>
						</tr>
						<tr>
							<td>Chargeoff Date:</td>
							<td class="t-color">charge_off_date</td>
						</tr>
						<tr>
							<td>Chargeoff Amount:</td>
							<td class="t-color">unadjusted_amount</td>
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
							<h1 class='lg:text-lg text-2xl font-semibold text-[#7661E2]'>$2377.89</h1>
							<h1 class='text-sm text-[#717782]'>Total Payments:</h1>
							<h1 class='lg:text-lg text-2xl font-semibold text-[#FB896B]'>$2377.89</h1>
							<h1 class='text-sm text-[#717782]'>Final Payment Date:</h1>
							<h1 class='lg:text-lg text-2xl font-semibold text-[#394252]'>05/01/2022</h1>
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
					{#each items as item,index}
						<tr>
							<td>04/01/2022</td>
							<td>$2015.56</td>
							<td class='text-green-500'>Approved</td>
						</tr>
					{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
<style>
	.t-color{
		color:#717782;
	}
	.p-head th{
		color:#717782;
		font-size: 1rem;
	}
	.p-head td{
		color:#23262F;
		font-size: 1rem;
	}
	@media (min-width: 380px){
		.circleOuter{
			--value:100;
			--size:14rem;
			--thickness: 4rem;
			color:#7661E2;
		}
		.circleInner{
			--value:80;
			--size:14rem;
			--thickness: 4rem;
			color:#FB896B;
		}

	}
	@media (min-width: 1280px){
		.circleOuter{
			--value:100;
			--size:20rem;
			--thickness: 5rem;
			color:#7661E2;
		}
		.circleInner{
			--value:80;
			--size:20rem;
			--thickness: 5rem;
			color:#FB896B;
		}
	}
</style>