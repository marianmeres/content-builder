<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import {
		createNotificationsStore,
		type createAlertConfirmPromptStore
	} from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { twMerge } from 'tailwind-merge';
	import ContentNode from './components/ContentNode.svelte';
	import type { ContentBuilderStore } from './content-builder.js';
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

	export let store: ContentBuilderStore;

	export let i18n: Record<string, string> = {
		empty: 'Click here to append the first content block',
		node_remove: 'Remove this content block',
		node_remove_confirm_title: 'Are you sure to delete <b>"{{label}}"</b>?',
		node_remove_confirm: [
			'This operation removes the content block <b>"{{label}}"</b> and all its inner blocks (if any).',
			'There is no undo. Continue?'
		].join(' '),
		node_add: 'Add a new content block inside this block',
		node_duplicate: 'Duplicate this content block',
		node_edit: 'Edit this content block',
		node_edit_drag: 'Click to edit this content block or drag to move',
		//
		label_label: 'Label',
		label_desc: 'For your internal reference only.',
		//
		type_label: 'Content block type',
		type_desc:
			'This will affect how this content block is rendered. Note that changing the type resets all current block properties.',
		//
		props_fieldset_legend: 'Content block properties',
		//
		html_label: 'Block inner HTML (advanced)',
		html_desc: 'Be careful. You can break things.',
		//
		style_label: 'Block CSS (advanced)',
		style_desc: 'Note that some content blocks may ignore this value.',
		//
		hidden_label: 'Hidden',
		hidden_desc:
			'If checked, this block including its inner blocks will not be rendered.',
		//
		allow_inner_label: 'Allow this block to contain inner blocks',
		allow_inner_desc:
			'If unchecked, any existing inner blocks will not be rendered, but will remain intact.'
	};

	export let theme: Partial<ContentBuilderTheme> = {};

	// prettier-ignore
	export let notifications: ReturnType<typeof createNotificationsStore> | undefined = undefined;
	// prettier-ignore
	export let acp: ReturnType<typeof createAlertConfirmPromptStore> | undefined = undefined;

	export const t = (i18nKey: string, params: any = {}) => {
		return i18n?.[i18nKey] ?? i18nKey;
	};

	export let disabled = false;
	export let highlightedNodeKey: string | undefined | null = undefined;

	export function setHighlightedNodeKey(key: string | null) {
		highlightedNodeKey = key;
	}

	//
	export async function defaultOnNodeEdit(
		key: string,
		value: ContentBuilderNodeValue
	): Promise<boolean> {
		if (!acp) {
			console.warn(
				'Default `defaultOnNodeEdit` is a no-op, because `acp` instance was not provided.'
			);
			return false;
		} else {
			store.resetError();

			const valueData = await new Promise((resolve) => {
				acp?.prompt(
					(_value: string) => {
						try {
							_value = JSON.parse(_value);
							acp!.close();
							resolve(_value);
						} catch (e) {
							acp!.setHeadValue(_value);
							(notifications || console).error("Invalid JSON data. Can't continue...");
						}
					},
					{
						content: 'Valid JSON is required. Edit at your own risk.',
						value: JSON.stringify(value, null, 2),
						promptFieldProps: { type: 'textarea', class: { input: 'font-mono' } },
						iconFn: false,
						title: {
							html: [
								`<span class="flex items-center justify-between">`,
								`<span>Advanced content block data editor</span>`,
								`<code class="text-xs opacity-50 font-normal">${key}</code>`,
								`</span>`
							].join(' ')
						}
					}
				);
			});

			// @ts-ignore
			valueData && store.edit(key, valueData);
			return !!valueData;
		}
	}

	export let onNodeEditRequest: (
		key: string,
		value: ContentBuilderNodeValue
	) => Promise<boolean> = defaultOnNodeEdit;

	export let debug = false;

	// this is a readonly tree!
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
</script>

<div class={twMerge(`${_class}`)}>
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
			{highlightedNodeKey}
			{debug}
		/>
	{:else}
		<div class="text-center">
			<button
				type="button"
				class="
					text-sm mx-auto
					text-gray-800
					border-dashed border-[3px] border-gray-300
					hover:border-black
					focus:outline-none focus:border-black
					rounded-md
					p-2 px-3
					flex items-center justify-center leading-none
					group
				"
				on:click={() => store.add(null)}
			>
				<span class="opacity-75 group-hover:opacity-100">{@html t('empty')}</span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	:global([data-content-builder-node-highlighted]) {
		background-color: #fefce8;
	}
	:global([data-content-builder-node-hidden]) {
		// opacity: 0.5;
		@apply text-red-500;
	}
</style>
