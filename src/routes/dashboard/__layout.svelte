<script lang="ts">
    import Header from "../../lib/header/Header.svelte";
    import '../../app.css';
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import Home from "../../lib/icons/Home.svelte";
    import User from "../../lib/icons/User.svelte";
    import Phone from "../../lib/icons/Phone.svelte";
    import Faq from "../../lib/icons/Faq.svelte";
    import Logout from "../../lib/icons/Logout.svelte";

    import {page} from '$app/stores';
    import * as cookie from "cookie";


    let user = {loggedIn: false};

    function toggle() {
        user.loggedIn = !user.loggedIn;
    }

    onMount(async () => {
        const cookies = cookie.parse(document.cookie)
        if (!(cookies && cookies['sid'])) {
            await goto('/login');
        } else {
            user.loggedIn = true
        }
    })
</script>


{#if user.loggedIn}
    <main>
        <div class=" shadow bg-base-200 drawer drawer-mobile">
            <input id="my-drawer" type="checkbox" class="drawer-toggle"/>
            <div class="drawer-content">
                <Header on:click={toggle}/>
                <!-- Page content here -->
                <slot/>
            </div>
            <div class="drawer-side" data-theme="dark">
                <label for="my-drawer" class="drawer-overlay"></label>
                <ul class="menu p-4 overflow-y-auto w-64 bg-base-100 text-base-content">
                    <li><a class="btn btn-ghost normal-case text-xl">Logotype</a></li>
                    <li><a class={`${$page.routeId==="dashboard"? 'active': ''}`} href="/dashboard">
                        <Home/>
                        Home</a></li>
                    <li><a class={`${$page.routeId==="dashboard/profile"? 'active': ''}`} href="/dashboard/profile">
                        <User/>
                        Profile</a></li>
                    <li><a class={`${$page.routeId==="dashboard/faq"? 'active': ''}`}
                           href="https://tarefinancial.com/faq">
                        <Faq/>
                        FAQ</a></li>
                    <li><a class={`${$page.routeId==="dashboard/contactus"? 'active': ''}`}
                           href="https://tarefinancial.com/contact">
                        <Phone/>
                        Contact Us</a></li>
                    <li><a on:click={()=>goto('/logout')}>
                        <Logout/>
                        Log Out</a></li>
                </ul>
            </div>
        </div>

    </main>
{/if}