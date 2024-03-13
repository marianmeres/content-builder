<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import {
		iconHeroMiniCodeBracket,
		iconHeroMiniTrash,
		iconHeroMiniXMark
	} from '@marianmeres/icons-fns';
	import {
		Button,
		Field,
		FieldCheckbox,
		FieldSelect,
		createAlertConfirmPromptStore,
		createConfirm,
		createNotificationsStore,
		tooltip
	} from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { derived, writable } from 'svelte/store';
	import ContentBuilder from '../ContentBuilder.svelte';
	import type { ContentBuilderStore } from '../content-builder.js';
	import type {
		ContentBuilderNodeValue,
		ContentNodeEditorTypeConfig,
		ContentNodeEditorTypeConfigProp
	} from '../types.js';
	import { defaultTypesConfig } from './editor/default-types-config.js';

	interface NormalizedConfig {
		label: string;
		props: Map<string, ContentNodeEditorTypeConfigProp>;
		allowInnerBlocks: Partial<ContentNodeEditorTypeConfig['allowInnerBlocks']>;
	}

	const clog = createClog('ContentNodeEditor');

	const _stringify = (v: any) => JSON.stringify(v || '', null, 2);

	const isFn = (v: any) => typeof v === 'function';
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let _class = '';
	export { _class as class };
	export let buttonBoxClass = '';

	// prettier-ignore
	export let notifications: ReturnType<typeof createNotificationsStore> | undefined = undefined;
	// prettier-ignore
	export let acp: ReturnType<typeof createAlertConfirmPromptStore> | undefined = undefined;

	export let store: ContentBuilderStore;

	export let key: string = '';

	export let builder: undefined | ContentBuilder = undefined;

	export let typesConfig: ContentNodeEditorTypeConfig[] = [];

	export function setKey(_key: string) {
		key = _key;
	}

	export let afterEdit: CallableFunction | undefined = undefined;
	export let afterClose: CallableFunction | undefined = undefined;
	export let afterRemove: CallableFunction | undefined = undefined;

	export let showButtonEdit = true;
	export let showButtonClose = true;
	export let showButtonRemove = true;

	export let size: 'sm' | 'md' = 'md';

	export let t: (i18nKey: string, params?: any) => string = (
		i18nKey: string,
		params?: any
	) => i18nKey;

	// read and normalize config
	$: _typesConfig = [...defaultTypesConfig, ...typesConfig];
	$: _typeConfigMap = _typesConfig.reduce((m, o) => {
		m.set(o.value, {
			label: o.label || o.value,
			props: (o.props || []).reduce((m2, p) => {
				m2.set(p.name, p);
				return m2;
			}, new Map<string, ContentNodeEditorTypeConfigProp>()),
			allowInnerBlocks: o?.allowInnerBlocks || {}
		});

		return m;
	}, new Map<string, NormalizedConfig>());

	// node value shape: {
	//   type: 'default', label: '', props: { html: '', style: '' }, allowInnerBlocks: true
	// };

	// load current node
	$: builder?.setHighlightedNodeKey(key || null);
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
	$: node = tree.find(key);

	// expose some
	export function close() {
		key = '';
		afterClose?.();
	}

	export async function openRawEditor() {
		node && (await builder?.defaultOnNodeEdit?.(key, $value));
		afterEdit?.();
	}

	export async function remove() {
		const c = acp
			? createConfirm(acp, {
					title: t('node_remove_confirm_title'),
					variant: 'warn'
				})
			: confirm;
		if (await c(t('node_remove_confirm'))) {
			store.remove(key);
		}
		afterRemove?.();
	}

	// prepare stores
	const _type = writable('');
	const _label = writable('');
	const _props = writable<Record<string, any>>({});
	const _allowInnerBlocks = writable(true);

	// final node "value"
	const value = derived(
		[_type, _label, _props, _allowInnerBlocks],
		([type, label, props, allowInnerBlocks]) => {
			return {
				...(node?.value || {}),
				type,
				label,
				props,
				allowInnerBlocks
			};
		}
	);

	// fill/reset stores based on current node
	$: $_type = node?.value?.type || 'default';
	$: $_label = node?.value?.label || '';
	$: $_props = node?.value?.props || {};
	$: $_allowInnerBlocks = !!node?.value?.allowInnerBlocks;

	// always add "hidden" prop
	$: if ($_props.hidden === undefined) {
		$_props.hidden = false;
	}

	// pick current type config
	let typeConfig: NormalizedConfig | undefined | null = null;
	$: if ($_type) typeConfig = _typeConfigMap.get($_type);

	const _applyConfigProps = (props: Record<string, any>, hard = false) => {
		props = { ...props };
		typeConfig?.props.forEach((v, k) => {
			if (hard) props[k] = v?.value;
			else if (props[k] === undefined) props[k] = v?.value;
		});
		return props;
	};

	const _typeExists = (type: string) => _typeConfigMap.has(type);

	// initialize store if node was not seen yet
	let _seen: Record<string, string> = {};
	$: if (node && !_seen[key]) {
		_seen[key] = node.value.type;
		$_props = _applyConfigProps(node.value.props || {}, false); // defensive
	}

	// reset/reinitialize props store on type change
	$: if (node && _seen[key] !== $_type) {
		_seen[key] = $_type;
		$_props = _applyConfigProps($_props, true); // hard
	}

	const _save = () => node && store.edit(key, $value);

	// intentionally as fn (so the "t" fn will be available when passing the ContentBuilder's exposed t)
	const TYPE_TO_LABEL = (): Record<string, Record<string, string>> => ({
		html: {
			label: t('html_label'),
			description: t('html_desc')
		},
		style: {
			label: t('style_label'),
			description: t('style_desc')
		}
	});

	// DRY
	const _ifSmall = (size: 'sm' | 'md', ifSm: string, ifMd: string): any =>
		size === 'sm' ? ifSm : ifMd;

	// DRY
	const _commonInputProps = {
		class: {
			input: `font-mono bg-white p-1 ${_ifSmall(size, 'text-xs', 'text-sm')}`,
			description: _ifSmall(size, 'text-xs', 'text-sm')
		}
	};

	const TYPE_TO_FIELD = {
		text: {
			component: Field,
			props: {
				..._commonInputProps,
				type: 'text'
			}
		},
		textarea: {
			component: Field,
			props: {
				..._commonInputProps,
				type: 'textarea'
			}
		}
	};

	const _getCmp = (name: string, inputType: any): { component: any; props: any } => {
		let { component, props } = (TYPE_TO_FIELD as any)[inputType] || {
			component: null,
			props: {}
		};
		props = { ...props, ...(TYPE_TO_LABEL()[name] || {}) };
		return { component, props };
	};
</script>

{#if node}
	{#key node.key}
		<form class={_class}>
			<Field
				bind:value={$_label}
				type="text"
				label={t('label_label')}
				description={t('label_desc')}
				size={_ifSmall(size, 'sm', 'md')}
				class={{ input: 'bg-white p-1 text-sm rounded-r-none' }}
				on:change={_save}
			>
				<span
					slot="input_after"
					class="text-xs font-mono px-2 flex items-center opacity-50"
					use:tooltip
					aria-label="Internal content block ID"
				>
					{key}
				</span>
			</Field>
			{#if _typeExists($_type)}
				<FieldSelect
					label={t('type_label')}
					description={t('type_desc')}
					bind:value={$_type}
					class={{
						input: 'bg-white p-1 text-sm',
						description: _ifSmall(size, 'text-xs', 'text-sm')
					}}
					options={_typesConfig.map((o) => ({
						label: o.label || o.value,
						value: o.value
					}))}
					size={_ifSmall(size, 'sm', 'md')}
					on:change={_save}
				/>
			{:else}
				<Field
					bind:value={$_type}
					type="text"
					label={t('type_label')}
					size={_ifSmall(size, 'sm', 'md')}
					class={{ input: 'bg-white p-1 text-sm rounded-r-none' }}
					disabled
				/>
			{/if}

			{#if typeConfig?.props}
				{#each typeConfig.props.entries() as [k, v]}
					{@const cmp = _getCmp(k, v.inputType)}
					<!-- <pre class="text-xs">{_stringify({ k, v })}</pre> -->
					<!-- @ts-ignore -->
					<svelte:component
						this={cmp.component}
						{...cmp.props || {}}
						name={k}
						bind:value={$_props[k]}
						on:change={_save}
						size={_ifSmall(size, 'sm', 'md')}
					/>
				{/each}
			{/if}

			<FieldCheckbox
				label={t('hidden_label')}
				description={t('hidden_desc')}
				bind:checked={$_props.hidden}
				on:change={_save}
				size={_ifSmall(size, 'sm', 'md')}
				class={{ description: _ifSmall(size, 'text-xs', 'text-sm') }}
			/>

			{#if !typeConfig?.allowInnerBlocks?.hidden && _typeExists($_type)}
				<FieldCheckbox
					label={t('allow_inner_label')}
					description={t('allow_inner_desc')}
					bind:checked={$_allowInnerBlocks}
					on:change={_save}
					size={_ifSmall(size, 'sm', 'md')}
					class={{ description: _ifSmall(size, 'text-xs', 'text-sm') }}
				/>
			{/if}

			<!-- <pre class="text-xs">{_stringify($value)}</pre> -->

			{#if showButtonEdit || showButtonClose || showButtonRemove}
				<div class={twMerge('space-x-2 mt-8', buttonBoxClass)}>
					{#if showButtonEdit}
						<span use:tooltip aria-label="Advanced raw data editor">
							<Button
								size={_ifSmall(size, 'sm', 'md')}
								data-content-editor-edit
								on:click={openRawEditor}
							>
								{@html iconHeroMiniCodeBracket({ size: 16 })}
							</Button>
						</span>
					{/if}
					{#if showButtonRemove}
						<span use:tooltip aria-label="Delete this content block">
							<Button
								size={_ifSmall(size, 'sm', 'md')}
								data-content-editor-remove
								on:click={remove}
							>
								{@html iconHeroMiniTrash({ size: 16 })}
							</Button>
						</span>
					{/if}
					{#if showButtonClose}
						<span use:tooltip aria-label="Close this editor">
							<Button
								size={_ifSmall(size, 'sm', 'md')}
								data-content-editor-close
								on:click={close}
							>
								{@html iconHeroMiniXMark({ size: 16 })}
							</Button>
						</span>
					{/if}
				</div>
			{/if}
		</form>
	{/key}
{/if}
