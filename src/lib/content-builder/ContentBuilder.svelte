<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { Tree } from '@marianmeres/tree';
	import { twMerge } from 'tailwind-merge';
	import ContentNode from './components/ContentNode.svelte';
	import { createContentBuilderStore } from './content-builder.js';
	import type { ContentBuilderNodeValue } from './types.js';
	import ContentNodeDropzone from './components/ContentNodeDropzone.svelte';

	export interface ContentBuilderTheme {
		li: string;
		li_hi: string;
		li_low: string;
		hover_control: {
			box: string;
			button: string;
		};
	}

	export interface ContentBuilderNodeValueTypesConfig {
		[type: string]: {
			component: Function;
			props?: Record<string, any>;
		};
	}
</script>

<script lang="ts">
	const clog = createClog('ContentBuilder');

	let _class = '';
	export { _class as class };

	export let store: ReturnType<typeof createContentBuilderStore>;

	export let i18n: Record<string, string> = {
		instructions: 'Drag to reorder. Edit label. Use control buttons for more.',
		node_remove: 'Remove this content block',
		node_remove_confirm: "Are you sure you wan't to remove this content block?",
		node_add: 'Add new content block inside this block',
		node_duplicate: 'Duplicate this content block',
		node_edit: 'Edit this content block'
	};

	export let theme: Partial<ContentBuilderTheme> = {};

	export let nodeTypesConfig: ContentBuilderNodeValueTypesConfig = {};

	const t = (i18nKey: string, params: any = {}) => {
		return i18n?.[i18nKey] || i18nKey;
	};

	// $: clog($store);

	// this is a readonly tree!
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
</script>

<div class={twMerge(`${_class}`)}>
	{#if $store?.error}
		<code class="text-red-500 mb-4 block">{$store.error}</code>
	{/if}
	<div class="text-sm opacity-50 border-b pb-2">{@html t('instructions')}</div>
	<div class="px-4 pt-2">
		<ContentNode node={tree.root} {store} {t} {theme} {nodeTypesConfig} />
	</div>
	<!-- <pre class="text-xs">{JSON.stringify($store?.data, null, 2)}</pre> -->
</div>
