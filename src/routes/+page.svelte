<script lang="ts">
	import { Button } from '@marianmeres/stuic';
	import {
		ContentBuilder,
		createContentBuilderStore,
		type ContentBuilderNodeValue
	} from '../lib/index.js';
	import type { TreeNodeDTO } from '@marianmeres/tree';
	import { createClog } from '@marianmeres/clog';
	import FooNodeType from './_components/FooNodeType.svelte';

	const clog = createClog('+page');

	const storage = (): any => {
		return typeof sessionStorage === 'undefined' ? null : sessionStorage;
	};

	const store = createContentBuilderStore(storage()?.getItem('dump'), {
		save: async (dump: string) => {
			return new Promise((resolve) => {
				setTimeout(() => {
					storage()?.setItem('dump', dump);
					resolve(true);
				}, 1_000);
			});
		}
	});

	const nodeTypesConfig = {
		// foo: {
		// 	component: FooNodeType,
		// 	props: { class: 'text-red-500' }
		// }
	};

	//
	// $: clog($store);
</script>

<div class="p-4 space-x-4">
	<ContentBuilder {store} {nodeTypesConfig} />

	<!-- {#if $store.size > 1} -->
	<!--  -->
	<!-- {:else} -->

	<!-- {/if} -->
</div>
<div class="pt-2 border-t">
	<Button
		on:click={() => {
			store.add(null, {
				type: 'html',
				label: `html #${store.counter()}`,
				allowChildren: true
			});
		}}
	>
		click
	</Button>
	{#if $store?.isSaving}
		<div>Saving...</div>
	{/if}
</div>
