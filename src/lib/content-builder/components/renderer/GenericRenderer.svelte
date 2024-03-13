<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let key: string = '';
	export let type: string = '';

	export let html: string | undefined = undefined;
	export let style: string = '';

	let _class: string = '';
	export { _class as class };

	export let hidden = false;

	// so we can have a "flexible spacer"
	let _defaultClass = 'flex flex-col';

	$: console.log('key', $$props);
</script>

<div
	{style}
	class={twMerge(_defaultClass, _class, hidden ? 'hidden' : '')}
	id={key}
	data-content-builder-type={type}
	{hidden}
>
	{#if html !== undefined}
		<!-- important to wrap inside a div because of flexible spacers -->
		<div>{@html html}</div>
	{/if}
	<slot />
</div>
