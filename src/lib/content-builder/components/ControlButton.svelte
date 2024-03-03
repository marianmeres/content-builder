<script lang="ts">
	import { tooltip } from '@marianmeres/stuic';
	import { twMerge } from 'tailwind-merge';
	import type { ContentBuilderTheme } from '../ContentBuilder.svelte';

	let _class = '';
	export { _class as class };

	export let ariaLabel = '';
	export let theme: Partial<ContentBuilderTheme>;
	export let disabled = false;
</script>

<button
	class={twMerge(`
        px-3 py-2 
        opacity-80
        text-white
        hover:underline hover:opacity-100 hover:bg-gray-700 
        ${theme?.hover_control?.button || ''}
        ${_class}
    `)}
	on:click
	aria-label={ariaLabel}
	use:tooltip
	{disabled}
>
	<slot />
</button>
