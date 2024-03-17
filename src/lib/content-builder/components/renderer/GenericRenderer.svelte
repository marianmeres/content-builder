<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	// toto je zoznam vsetkych defaultnych props, ktore vzdy chodia
	let _class: string = '';
	export { _class as class };
	export let key: string | undefined = '';
	export let type: string | undefined = '';
	export let html: string | undefined = '';
	export let style: string | undefined = '';
	export let hidden: boolean | undefined = false;
	export let __typeIsValid: boolean = false;

	// so we can have a "flexible spacer"
	let _defaultClass = 'flex flex-col';
</script>

<div
	{style}
	class={twMerge(_defaultClass, _class, hidden ? 'hidden' : '')}
	id={key}
	data-content-builder-type={type}
	{hidden}
	data-content-builder-node-type-invalid={__typeIsValid ? undefined : type}
>
	<!-- important to wrap inside a div because of flexible spacers -->
	{#if html}
		<div>{@html html}</div>
	{/if}
	<slot />
</div>
