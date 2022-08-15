<script>
    import {onMount} from "svelte";
    import {api} from "$lib/_api";
    import {goto} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";
    import {userInfo} from "$lib/store/UserInfoStore";
    import {DasboardInfo} from "$lib/store/dashboardinfoStore";

    onMount(async () => {
        const jsonData = {
            name: $userInfo.customer ? $userInfo.customer.name : $DasboardInfo.customer.name
        }
        const response = await api('POST', `auth/docuSign`, jsonData);
        let rjson = await response.json()
        if (rjson.status) {
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