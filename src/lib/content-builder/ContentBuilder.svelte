<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { iconFeatherHelpCircle } from '@marianmeres/icons-fns';
	import { createPrompt, type createAlertConfirmPromptStore } from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { createEventDispatcher } from 'svelte';
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
		// instructions: 'Edit label and use hover control buttons for more. Drag to move.',
		empty: 'Empty content. Click here to append first block.',
		node_remove: 'Remove this content block',
		node_remove_confirm_title: 'Are you sure?',
		node_remove_confirm: [
			'This operation removes the selected content block and saves it immediately.',
			'It is not possible to undo. Continue?'
		].join(' '),
		node_add: 'Add new content block inside this block',
		node_duplicate: 'Duplicate this content block',
		node_edit: 'Edit this content block',
		drag_to_reorder: 'Drag to move'
	};

	export let theme: Partial<ContentBuilderTheme> = {};

	export let nodeValueByTypeConfig: ContentBuilderNodeValueTypesConfig = {};

	export let acp: null | ReturnType<typeof createAlertConfirmPromptStore> = null;

	const t = (i18nKey: string, params: any = {}) => {
		return i18n?.[i18nKey] || i18nKey;
	};

	export let disabled = false;

	//
	const defaultOnNodeEdit = async (key: string, value: ContentBuilderNodeValue) => {
		if (!acp) {
			console.warn(
				'Default `defaultOnNodeEdit` is a no-op, because `acp` instance was not provided.'
			);
		} else {
			store.resetError();
			const valueData = await createPrompt(acp)(
				'Valid JSON format is required.',
				JSON.stringify(value, null, 2),
				{
					promptFieldProps: { type: 'textarea', class: { input: 'font-mono' } },
					iconFn: false,
					title: {
						html: [
							`<span class="flex items-center justify-between">`,
							`<span>Content block raw editor</span>`,
							`<code class="text-xs opacity-50 font-normal">${key}</code>`,
							`</span>`
						].join(' ')
					}
				}
			);
			// @ts-ignore
			store.edit(key, valueData);
		}
	};

	export let onNodeEditRequest: (
		key: string,
		value: ContentBuilderNodeValue
	) => Promise<void> = defaultOnNodeEdit;

	export let debug = false;

	// this is a readonly tree!
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
</script>

<div class={twMerge(`${_class}`)}>
	<!-- {#if $store?.error}
		<code class="text-red-500 mb-4 block">{$store.error}</code>
	{/if} -->
	<!-- <div class="px-4 pb-2"> -->
	{#if $store.size > 1}
		<ContentNode
			node={tree.root}
			{store}
			{t}
			{theme}
			{disabled}
			{acp}
			{onNodeEditRequest}
			showNodeId={debug}
		/>
	{:else}
		<div class="text-center">
			<button
				class="
					text-sm mx-auto
					text-gray-800
					border-dashed border-[3px] border-gray-300
					hover:border-black
					focus:outline-none focus:border-black
					px-3 py-1
					rounded-md
				"
				on:click={() => store.add(null)}
			>
				{@html t('empty')}
			</button>
		</div>
	{/if}
	<!-- </div> -->
	<!-- {#if $store.size > 1}
		<div class="text-sm opacity-50 flex items-center">
			{@html iconFeatherHelpCircle({ size: 16, class: 'mr-2' })}
			{@html t('instructions')}
		</div>
	{/if} -->
</div>
