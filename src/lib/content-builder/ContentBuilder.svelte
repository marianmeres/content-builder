<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { iconFeatherHelpCircle } from '@marianmeres/icons-fns';
	import type { createAlertConfirmPromptStore } from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { twMerge } from 'tailwind-merge';
	import ContentNode from './components/ContentNode.svelte';
	import { createContentBuilderStore } from './content-builder.js';
	import type { ContentBuilderNodeValue } from './types.js';

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
		instructions: 'Edit label and use hover control buttons for more. Drag to reorder.',
		empty: 'Empty content.',
		node_remove: 'Remove this content block',
		node_remove_confirm_title: 'Are you sure?',
		node_remove_confirm: [
			'This operation removes the selected content block and saves it immediately.',
			'It is not possible to undo. Continue?'
		].join(' '),
		node_add: 'Add new content block inside this block',
		node_duplicate: 'Duplicate this content block',
		node_edit: 'Edit this content block'
	};

	export let theme: Partial<ContentBuilderTheme> = {};

	export let nodeValueByTypeConfig: ContentBuilderNodeValueTypesConfig = {};

	export let acp: null | ReturnType<typeof createAlertConfirmPromptStore> = null;

	const t = (i18nKey: string, params: any = {}) => {
		return i18n?.[i18nKey] || i18nKey;
	};

	export let disabled = false;

	// this is a readonly tree!
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
</script>

<div class={twMerge(`${_class}`)}>
	{#if $store?.error}
		<code class="text-red-500 mb-4 block">{$store.error}</code>
	{/if}
	<div class="px-4 pb-2">
		{#if $store.size > 1}
			<ContentNode
				node={tree.root}
				{store}
				{t}
				{theme}
				{nodeValueByTypeConfig}
				{disabled}
				{acp}
				on:edit_request
			/>
		{:else}
			<div class="text-sm opacity-50 text-center">{@html t('empty')}</div>
		{/if}
	</div>
	{#if $store.size > 1}
		<div class="text-sm opacity-50 flex items-center">
			{@html iconFeatherHelpCircle({ size: 16, class: 'mr-2' })}
			{@html t('instructions')}
		</div>
	{/if}
</div>
