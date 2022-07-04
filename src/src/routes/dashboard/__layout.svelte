<script lang="ts">
	import Header from "../../lib/header/Header.svelte";
	import '../../app.css';

	let user = { loggedIn: true };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}
</script>

{#if user.loggedIn}
	<main>
		<div class="rounded-lg shadow bg-base-200 drawer drawer-mobile">
			<input id="my-drawer" type="checkbox" class="drawer-toggle" />
			<div class="drawer-content">
				<Header on:click={toggle} />
				<!-- Page content here -->
				<slot />
			</div>
			<div class="drawer-side" data-theme="dark">
				<label for="my-drawer" class="drawer-overlay"></label>
				<ul class="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
					<li><a class="btn btn-ghost normal-case text-xl">Logotype</a></li>
					<li><a href="/dashboard">Home</a></li>
					<li><a href="/dashboard/profile">Profile</a></li>
					<li><a>FAQ</a></li>
					<li><a>Contact Us</a></li>
					<li><a href="/">Log Out</a></li>
				</ul>
			</div>
		</div>

	</main>
{:else}
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row-reverse">

			<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
				<div class="card-body">
					<h1 class="text-5xl font-bold">Login now!</h1>
					<div class="form-control">
						<label class="label">
							<span class="label-text">Email</span>
						</label>
						<input type="text" placeholder="email" class="input input-bordered" />
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text">Password</span>
						</label>
						<input type="text" placeholder="password" class="input input-bordered" />
						<label class="label">
							<a href="#" class="label-text-alt link link-hover">Forgot password?</a>
						</label>
					</div>
					<div class="form-control mt-6">
						<button class="btn btn-primary" on:click={toggle}>Login</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
<!--<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>-->
