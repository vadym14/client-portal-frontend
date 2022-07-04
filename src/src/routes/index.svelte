
<!--<script context="module" lang="ts">
    import { userData } from '$lib/store/userStore';

    import type { Load } from '@sveltejs/kit';

    export const load: Load = async (userData) => {

        if (userData.username === '')  {
            return {
                status: 302,
                redirect: '/login'
            };
        }
        if (!userData.username !== '') {
            return {
                status: 302,
                redirect: '/dashboard'
            };
        }
        return {
            props: { userData}
        };
    };
</script>-->
<!--
<script context="module">
    import {userData} from '$lib/store/userStore';
    import {page} from '$app/stores';
    import {goto} from "$app/navigation";
    import type { Load } from '@sveltejs/kit';
    import type { User, UserResponse } from '$lib/interfaces/user.interface';

    export const load: Load = async ({ fetch }) => {
        const [userRes, errs] = await getCurrentUser(
            fetch,
            `${variables.BASE_API_URI}/token/refresh/`,
            `${variables.BASE_API_URI}/user/`
        );

        const userResponse: User = userRes;

        if (errs.length > 0 && !userResponse.id) {
            return {
                status: 302,
                redirect: '/accounts/login'
            };
        }

        return {
            props: { userResponse }
        };
    };
        return {props: {token: session.token, username: session.user.username}}
        }

if (!$userData.username){
    goto('/login', {replaceState: true})
}else if($userData.username){
    goto('/dashboard', {replaceState: true})
}
</script>-->
<script>
    import { userData } from '$lib/store/userStore';
    import {onMount} from "svelte";
    import {browser} from '$app/env';
    import {browserGet, getCurrentUser} from "../lib/utils/requestUtils";
    import {variables} from "../lib/utils/constants";
    import {goto} from "$app/navigation";
    onMount(async () => {
        if (browser) {
            if (userData.username === '')  {
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

