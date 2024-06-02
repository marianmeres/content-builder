<script lang="ts">
	import { Thc } from '@marianmeres/stuic';
	import type { THC } from '@marianmeres/stuic';
	import { twMerge } from 'tailwind-merge';

	// toto je zoznam vsetkych defaultnych props, ktore vzdy chodia
	let _class: string = '';
	export { _class as class };
	export let key: string | undefined = '';
	export let type: string | undefined = '';
	export let html: string | undefined | THC[] = '';
	export let style: string | undefined = '';
	export let hidden: boolean | undefined = false;
	export let __typeIsValid: boolean = false;

	// so we can have a "flexible spacer"
	let _defaultClass = 'flex flex-col relative';

	let _thcSegments: THC[] = [];
	$: if (html) {
		_thcSegments = Array.isArray(html) ? html : [html];
	} else {
		_thcSegments = [];
	}
</script>

{#key key}
	<div
		{style}
		class={twMerge(_defaultClass, _class, hidden ? 'hidden' : '')}
		id={key}
		data-content-builder-type={type}
		{hidden}
		data-content-builder-node-type-invalid={__typeIsValid ? undefined : type}
	>
		<!-- important to wrap inside a div because of flexible spacers -->
		<!-- {#if html}
			<div>{@html html}</div>
		{/if} -->
		{#if _thcSegments.length}
			{#each _thcSegments as thc}
				<div><Thc {thc} forceAsHtml /></div>
			{/each}
		{/if}
		<slot />
	</div>
{/key}
