<script>
    import {userData} from '$lib/store/userStore';
    import {onMount} from "svelte";
    import {browser} from '$app/env';
    import {browserGet, getCurrentUser} from "../lib/utils/requestUtils";
    import {variables} from "../lib/utils/constants";
    import {goto} from "$app/navigation";

    onMount(async () => {
        if (browser) {
            if (userData.username === '') {
                goto('dashboard')

            }
            if (!userData.username !== '') {
                goto('login')
            }
        }
    });

</script>
<svelte:head>
    <title>Home</title>
</svelte:head>

