<script>
    import {onMount} from "svelte";
    import {api} from "$lib/_api";
    import {goto} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";
    import {DasboardInfo} from "../lib/store/dashboardinfoStore";
    import {userInfo} from "../lib/store/UserInfoStore";

    onMount(async () => {
        $DasboardInfo = {}
        $userInfo = {}
        const response = await api('POST', `auth/logout`);
        let rjson = await response.json()
        if (rjson.status) {
            toast.push('Successfully logged out')
            await goto('/login')
        } else {
            toast.push('Something went wrong', {
                'theme': {
                    '--toastBackground': '#F56565',
                    '--toastBarBackground': '#C53030'
                }
            })
            await goto('/')
        }
    })
</script>