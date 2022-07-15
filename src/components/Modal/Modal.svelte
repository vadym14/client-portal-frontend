<script>
    import { isOpenModal } from '../../lib/store/modalStore.ts';
    import { fade } from 'svelte/transition';
</script>
{#if $isOpenModal}
    <div class='w-full h-screen fixed flex justify-center items-center bg-[rgba(0,0,0,0.8)] z-20'
         on:click={()=>{isOpenModal.set(false)}} transition:fade>
        <div class='px-8 py-10 relative w-[36rem] opacity-100 w-full justify-center text-center bg-white rounded'
             on:click|stopPropagation>
            <button class='absolute top-2 right-3 text-4xl text-gray-900 hover:text-pink'
                    on:click={()=>{isOpenModal.set(false)}}>
                &times;
            </button>
            <slot name='title'></slot>
            <slot />
        </div>
    </div>
{/if}
