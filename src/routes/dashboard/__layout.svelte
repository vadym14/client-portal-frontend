<script lang="ts">
	import Header from "../../lib/header/Header.svelte";
	import '../../app.css';
	import {onMount} from "svelte";
	import {userData1} from "../../lib/store/userStore";
	import {goto} from "$app/navigation";
	import Home from "../../lib/icons/Home.svelte";
	import User from "../../lib/icons/User.svelte";
	import Phone from "../../lib/icons/Phone.svelte";
	import Faq from "../../lib/icons/Faq.svelte";
	import Logout from "../../lib/icons/Logout.svelte";

	import { page } from '$app/stores';

	$:console.log($page)

	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}

	onMount(async () => {
		if(Object.keys($userData1).length === 0 ){
			await goto('/login');
		}
		else{
			user.loggedIn = true;
		}
	})
</script>


{#if user.loggedIn}
	<main>
		<div class=" shadow bg-base-200 drawer drawer-mobile">
			<input id="my-drawer" type="checkbox" class="drawer-toggle" />
			<div class="drawer-content">
				<Header on:click={toggle} />
				<!-- Page content here -->
				<slot />
			</div>
			<div class="drawer-side" data-theme="dark">
				<label for="my-drawer" class="drawer-overlay"></label>
				<ul class="menu p-4 overflow-y-auto w-64 bg-base-100 text-base-content">
					<li><a class="btn btn-ghost normal-case text-xl">Logotype</a></li>
					<li><a class={`${$page.routeId==="dashboard"? 'active': ''}`} href="/dashboard"><Home/> Home</a></li>
					<li><a class={`${$page.routeId==="dashboard/profile"? 'active': ''}`} href="/dashboard/profile"><User/>Profile</a></li>
					<li><a class={`${$page.routeId==="dashboard/faq"? 'active': ''}`} href="https://tarefinancial.com/faq"><Faq/>FAQ</a></li>
					<li><a class={`${$page.routeId==="dashboard/contactus"? 'active': ''}`} href="https://tarefinancial.com/contact"><Phone/>Contact Us</a></li>
					<li><a  href="/"><Logout/>Log Out</a></li>
				</ul>
			</div>
		</div>

	</main>
<!--{:else}-->
<!--	<div class="hero min-h-screen bg-base-200">-->
<!--		<div class="hero-content flex-col lg:flex-row-reverse">-->

<!--			<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">-->
<!--				<div class="card-body">-->
<!--					<h1 class="text-5xl font-bold">Login now!</h1>-->
<!--					<div class="form-control">-->
<!--						<label class="label">-->
<!--							<span class="label-text">Email</span>-->
<!--						</label>-->
<!--						<input type="text" placeholder="email" class="input input-bordered" />-->
<!--					</div>-->
<!--					<div class="form-control">-->
<!--						<label class="label">-->
<!--							<span class="label-text">Password</span>-->
<!--						</label>-->
<!--						<input type="text" placeholder="password" class="input input-bordered" />-->
<!--						<label class="label">-->
<!--							<a href="#" class="label-text-alt link link-hover">Forgot password?</a>-->
<!--						</label>-->
<!--					</div>-->
<!--					<div class="form-control mt-6">-->
<!--						<button class="btn btn-primary" on:click={toggle}>Login</button>-->
<!--					</div>-->
<!--				</div>-->
<!--			</div>-->
<!--		</div>-->
<!--	</div>-->
{/if}
<!--<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>-->
