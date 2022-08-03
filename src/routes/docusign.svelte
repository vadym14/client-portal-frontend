<script>
    import {goto} from "$app/navigation";
    import {api} from "$lib/_api";
    import {userInfo} from "$lib/store/UserInfoStore";
    import {handleServerMessages} from "$lib/utils/handleServerMessages";

    let btnLoading = false, btnDisable = false;
    const handleSave = async () => {
        btnLoading = btnDisable = true;
        const response = await api('post', `onboarding/docuSignUrl`, $userInfo);
        let rjson = await response.json()
        handleServerMessages(rjson.data._server_messages)
        if (rjson.status) {
            await goto(rjson.data.message)
        } else {
            btnLoading = btnDisable = false;
        }
    }

</script>


<section class="h-screen flex sm:bg-white lg:bg-base-200">
    <div class="m-auto">
        <div class="card  bg-[#7661E2] lg:px-32 py-8">
            <div class="card-body gap-8">
                <div class="sm:text-2xl lg:text-4xl text-white text-center whitespace-nowrap">Docusign Integration
                </div>
                <div class="card-actions justify-center">

                    <button class={`flex mx-auto btn border-0 bg-[#8A76F3] hover:bg-[#9e8df5] text-white font-medium text-base   sm:py-4 lg:py-2 lg:px-10 sm:px-24 rounded
   ${btnLoading?'loading':''}`}
                            disabled={btnDisable} on:click={()=>handleSave()}>Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>
