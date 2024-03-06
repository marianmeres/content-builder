<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		AlertConfirmPrompt,
		Button,
		createAlertConfirmPromptStore
	} from '@marianmeres/stuic';
	import { ContentBuilder, createContentBuilderStore } from '../lib/index.js';
	import FooNodeType from './_components/FooNodeType.svelte';

	const clog = createClog('+page');

	const storage = (): any => {
		return typeof sessionStorage === 'undefined' ? null : sessionStorage;
	};

	const store = createContentBuilderStore(storage()?.getItem('dump'), {
		save: async (dump: string) => {
			// simulate async server request...
			return new Promise((resolve) => {
				setTimeout(() => {
					storage()?.setItem('dump', dump);
					resolve(true);
				}, 1_000);
			});
		}
	});

	const acp = createAlertConfirmPromptStore();

	// just as an example...
	const nodeValueByTypeConfig = {
		foo: {
			component: FooNodeType,
			props: { class: 'text-red-500' }
		}
	};

	let disabled = false;
</script>

<div class="p-4 space-x-4">
	<ContentBuilder {store} {nodeValueByTypeConfig} {disabled} {acp} debug />
</div>
<div class="p-4 border-t space-x-4">
	<Button on:click={() => store.add(null)} size="sm" {disabled}>Append block</Button>
	<label class="inline-flex items-center space-x-2">
		<input type="checkbox" bind:checked={disabled} />
		<span>disabled</span>
	</label>
	<span>Blocks: {$store.size - 1}</span>
	{#if $store?.isSaving}
		<span class="opacity-25">Saving...</span>
	{/if}
</div>

<AlertConfirmPrompt {acp} />
