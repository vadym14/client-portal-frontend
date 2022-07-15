<script lang="ts">
	/*import { userData } from '$lib/store/userStore';
	import { navigating } from '$app/stores';
	import { loading } from '$lib/store/loadingStore';
	import { notificationData } from '$lib/store/notificationStore';
	import { fly } from 'svelte/transition';
	import { afterUpdate, onMount } from 'svelte';*/
	import { goto } from "$app/navigation";
	import {userData1} from '../lib/store/userStore.ts';
	import '../app.css';
	import { notificationData } from '$lib/store/notificationStore';
	import { fly } from 'svelte/transition';
	import {afterUpdate, onMount} from "svelte";
	afterUpdate(async () => {
		const notifyEl = document.getElementById('notification') as HTMLElement;
		// const notifyEl = document.getElementsByClassName('notification');
		if (notifyEl && $notificationData !== '') {
			setTimeout(() => {
				notifyEl.classList.add('disappear');
				notificationData.set('');
			}, 3000);
		}
	});
	onMount(async () => {
		if(Object.keys($userData1).length > 0 ){
			 // await goto('/dashboard');
		}
	})


	/*import Header from '../components/Header/Header.svelte';
	import Loader from '../components/Loader/Loader.svelte';

	$: loading.setNavigate(!!$navigating);
	$: loading.setLoading(!!$navigating, 'Loading, please wait...');

	import { getCurrentUser, browserGet } from '$lib/utils/requestUtils';
	import { variables } from '$lib/utils/constants';

	onMount(async () => {
		if (browserGet('refreshToken')) {
			const [response, errs] = await getCurrentUser(
					fetch,
					`${variables.BASE_API_URI}/token/refresh/`,
					`${variables.BASE_API_URI}/user/`
			);
			if (errs.length <= 0) {
				userData.set(response);
			}
		}
	});

	afterUpdate(async () => {
		const notifyEl = document.getElementById('notification') as HTMLElement;
		// const notifyEl = document.getElementsByClassName('notification');
		if (notifyEl && $notificationData !== '') {
			setTimeout(() => {
				notifyEl.classList.add('disappear');
				notificationData.set('');
			}, 3000);
		}
		if (browserGet('refreshToken')) {
			const [response, _] = await getCurrentUser(
					fetch,
					`${variables.BASE_API_URI}/token/refresh/`,
					`${variables.BASE_API_URI}/user/`
			);
			userData.update(() => response);
		}
	});*/
</script>

<main class="bg-base-200">
	{#if $notificationData}
		<div class="notification-container">
			<p
					class="notification"
					id="notification"
					in:fly={{ x: 200, duration: 500, delay: 500 }}
					out:fly={{ x: 200, duration: 500 }}
			>
				{$notificationData}
			</p>
		</div>
	{/if}
	<slot/>
</main>
