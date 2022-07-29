<script lang="ts">
    import '../app.css';
    import {onMount} from "svelte";
    import {SvelteToast} from '@zerodevx/svelte-toast'
    import {goto} from "$app/navigation";
    import * as cookie from 'cookie';
    import {page} from "$app/stores";
    import {api} from "../lib/_api";

    const options = {theme: {'--toastBackground': '#570df8', '--toastBarBackground': '#4506cb'}}

    onMount(async () => {
        const cookies = cookie.parse(document.cookie)
        if ($page.routeId !== 'logout') {
            if (cookies && cookies['sid']) {
                await goto('/dashboard');
            } else {
                await goto('/login');
            }
        }
    })

</script>
<SvelteToast {options}/>
<main class="bg-base-300">
    <slot/>
</main>
