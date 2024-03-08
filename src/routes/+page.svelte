<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		AlertConfirmPrompt,
		Button,
		createAlertConfirmPromptStore
	} from '@marianmeres/stuic';
	import {
		ContentBuilder,
		createContentBuilderStore,
		type ContentBuilderNodeValue
	} from '../lib/index.js';
	import ContentBuilderNodeRenderer, {
		type ContentBuilderRendererComponentDef
	} from '../lib/content-builder/ContentBuilderNodeRenderer.svelte';
	import { Tree } from '@marianmeres/tree';
	import Foo from './_components/Foo.svelte';

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
		},
		logger: clog
	});

	const acp = createAlertConfirmPromptStore();

	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);

	let disabled = false;

	const typeToComponentMap: Record<string, ContentBuilderRendererComponentDef> = {
		foo: {
			component: Foo,
			props: {
				foo: 'must be overwritten 2'
			}
		}
	};
</script>

<div class="p-6">
	<ContentBuilder {store} {disabled} {acp} debug />
</div>
{#if $store.size > 1}
	<div class="text-xs opacity-50 px-6 mb-4">
		Edit label and use hover control buttons for more. Drag to move.
	</div>
{/if}

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

{#if tree.size() > 1}
	<div class="p-4 bg-gray-50">
		<ContentBuilderNodeRenderer node={tree.root} {typeToComponentMap} />
	</div>
{/if}

<AlertConfirmPrompt {acp} />
