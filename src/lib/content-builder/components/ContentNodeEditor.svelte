<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import {
		iconHeroMiniArrowPath,
		iconHeroMiniCodeBracket,
		iconHeroMiniTrash,
		iconHeroMiniXMark
	} from '@marianmeres/icons-fns';
	import {
		Button,
		Field,
		FieldCheckbox,
		FieldRadios,
		FieldSelect,
		Fieldset,
		createAlertConfirmPromptStore,
		createConfirm,
		createNotificationsStore,
		tooltip
	} from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { derived, writable } from 'svelte/store';
	import { twMerge } from 'tailwind-merge';
	import ContentBuilder from '../ContentBuilder.svelte';
	import type { ContentBuilderStore } from '../content-builder.js';
	import type {
		ContentBuilderNodeValue,
		ContentNodeEditorTypeConfig,
		ContentNodeEditorTypeConfigProp
	} from '../types.js';
	import { defaultTypesConfig } from './editor/default-types-config.js';
	import { createEventDispatcher } from 'svelte';
	import { replaceMap } from '../utils.js';

	interface NormalizedConfig {
		label: string;
		description?: string;
		props: Map<string, ContentNodeEditorTypeConfigProp>;
		allowInnerBlocks: Partial<ContentNodeEditorTypeConfig['allowInnerBlocks']>;
	}

	const clog = createClog('ContentNodeEditor');

	const _stringify = (v: any) => JSON.stringify(v || '', null, 2);

	const isFn = (v: any) => typeof v === 'function';
</script>

<script lang="ts">
	const dispatch = createEventDispatcher();

	let _class = '';
	export { _class as class };
	export let buttonBoxClass = '';
	export let fieldsetBoxClass = '';
	export let fieldsetDescriptionClass = '';
	export let selectInputClass = '';

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
	export let showIsSaving = true;

	export let size: 'sm' | 'md' = 'md';

	export let t: (i18nKey: string, params?: any) => string = (
		i18nKey: string,
		params?: any
	) => i18nKey;

	// read and normalize config
	$: _typesConfig = [...defaultTypesConfig, ...typesConfig].sort((a, b) => {
		const aVal = [a.optgroup || '', a.label || a.value].join(' ');
		const bVal = [b.optgroup || '', b.label || b.value].join(' ');
		return aVal.localeCompare(bVal);
	});
	$: _typeConfigMap = _typesConfig.reduce(
		(m, o) => {
			m.set(o.value, {
				label: o.label || o.value,
				description: o.description,
				props: (o.props || []).reduce((m2, p) => {
					m2.set(p.name, p);
					return m2;
				}, new Map<string, ContentNodeEditorTypeConfigProp>()),
				allowInnerBlocks: o?.allowInnerBlocks || {}
			});

			return m;
		},
		// make sure `html` and `style` is preset in every type (so it resets properly)
		new Map<string, NormalizedConfig>([
			['html', { value: '' }],
			['style', { value: '' }]
		] as any)
	);

	// load current node
	$: builder?.setHighlightedNodeKey(key || null);
	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);
	$: node = tree.find(key);

	// expose some
	export function close() {
		key = '';
		afterClose?.();
		dispatch('closed');
	}

	export async function openRawEditor() {
		node && (await builder?.defaultOnNodeEdit?.(key, $value));
		afterEdit?.();
		dispatch('edited');
	}

	export async function remove() {
		const _t = (k: string) => {
			const html = replaceMap(t(k), { '{{label}}': node?.value.label });
			return { html };
		};
		const c = acp
			? createConfirm(acp, {
					title: _t('node_remove_confirm_title'),
					variant: 'warn'
				})
			: confirm;
		if (await c(_t('node_remove_confirm') as any)) {
			store.remove(key);
		}
		afterRemove?.();
		dispatch('removed');
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
	$: if (node) {
		$_type = node.value?.type || 'default';
		$_label = node.value?.label || '';
		$_props = node.value?.props || {};
		$_allowInnerBlocks = !!node.value?.allowInnerBlocks;
	}

	// always add "hidden" prop
	$: if ($_props.hidden === undefined) $_props.hidden = false;

	// pick current type config
	let typeConfig: NormalizedConfig | undefined | null = null;
	$: if ($_type) typeConfig = _typeConfigMap.get($_type);

	const _applyConfigProps = (props: Record<string, any>, hard = false) => {
		// if hard - we are switching type
		// else - we are initializing
		props = hard ? {} : { ...props };

		typeConfig?.props.forEach((v, k) => {
			// if (hard) props[k] = v?.value;
			// else if (props[k] === undefined) props[k] = v?.value;
			if (!hard && props[k] === undefined) props[k] = v?.value;
		});

		return props;
	};

	const _typeExists = (type: string) => _typeConfigMap.has(type);

	const _hasVisibleProps = (
		props: Map<string, ContentNodeEditorTypeConfigProp> | undefined
	) => {
		const entries = [...(props?.entries() || [])];
		if (!entries.length) return false;
		for (let [k, p] of entries) {
			if (p.inputType === 'hidden') return false;
		}
		return true;
	};

	// initialize store if node was not seen yet
	let _seen: Record<string, string> = {};
	$: if (node && !_seen[key]) {
		_seen[key] = node.value.type;
		$_props = _applyConfigProps(node.value.props || {}, false); // defensive
		if (typeConfig?.allowInnerBlocks?.value !== undefined) {
			$_allowInnerBlocks = !!typeConfig?.allowInnerBlocks?.value;
		}
	}

	// reset/reinitialize props store on type change
	$: if (node && _seen[key] !== $_type) {
		_seen[key] = $_type;
		$_props = _applyConfigProps($_props, true); // hard
		if (typeConfig?.allowInnerBlocks?.value !== undefined) {
			$_allowInnerBlocks = !!typeConfig?.allowInnerBlocks?.value;
		}
	}

	const _save = () => {
		if (node) {
			store.edit(key, $value);
			dispatch('saved');
		}
	};

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
			input: `font-mono bg-white p-1 ${_ifSmall(size, 'text-sm placeholder:text-sm', 'text-base placeholder:text-base')}`,
			description: _ifSmall(size, 'text-xs', 'text-sm')
		}
	};

	const TYPE_TO_FIELD = {
		text: {
			component: Field,
			props: {
				..._commonInputProps,
				type: 'text',
				class: {
					input: 'bg-white p-2 font-mono'
				}
			}
		},
		textarea: {
			component: Field,
			props: {
				..._commonInputProps,
				type: 'textarea',
				class: {
					input: 'bg-white p-2 font-mono'
				}
			}
		},
		select: {
			component: FieldSelect,
			props: {
				class: {
					input: 'bg-white p-2',
					description: _ifSmall(size, 'text-xs', 'text-sm')
				}
			}
		},
		radio: {
			component: FieldRadios,
			props: {
				class: {
					description: _ifSmall(size, 'text-xs', 'text-sm')
				}
			}
		},
		checkbox: {
			component: FieldCheckbox,
			props: {
				class: {
					description: _ifSmall(size, 'text-xs', 'text-sm')
				}
			}
		}
	};

	const _getCmp = (
		name: string,
		inputType: any,
		inputProps?: any
	): { component: any; props: any } => {
		let { component, props } = (TYPE_TO_FIELD as any)[inputType] || {
			component: null,
			props: {}
		};
		props = { ...(inputProps || {}), ...props, ...(TYPE_TO_LABEL()[name] || {}) };
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
				class={{ input: 'bg-white p-2 rounded-r-none' }}
				on:change={_save}
			>
				<span
					slot="input_after"
					class="text-xs font-mono px-2 flex items-center opacity-50"
					use:tooltip
					aria-label="Internal block ID"
				>
					{key}
				</span>
			</Field>
			{#if _typeExists($_type)}
				<FieldSelect
					label={t('type_label')}
					description={t('type_desc')}
					bind:value={$_type}
					class={TYPE_TO_FIELD.select.props.class}
					options={_typesConfig.map((o) => ({
						label: o.label || o.value,
						value: o.value,
						optgroup: o.optgroup || ''
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
					class={TYPE_TO_FIELD.text.props.class}
					disabled
				/>
			{/if}
			{#if _hasVisibleProps(typeConfig?.props) || typeConfig?.description}
				<Fieldset
					legend={typeConfig?.label}
					class={{ box: `mb-4 pb-2 ${fieldsetBoxClass}` }}
				>
					{#if typeConfig?.description}
						<div
							class={twMerge(
								'-mt-2 mb-3 opacity-50',
								fieldsetDescriptionClass,
								_ifSmall(size, 'text-xs', 'text-sm')
							)}
						>
							{@html typeConfig.description}
						</div>
					{/if}
					{#each typeConfig?.props?.entries() || [] as [k, v]}
						{@const cmp = _getCmp(k, v.inputType, v.inputProps)}
						<svelte:component
							this={cmp.component}
							{...cmp.props || {}}
							name={k}
							bind:value={$_props[k]}
							bind:group={$_props[k]}
							bind:checked={$_props[k]}
							on:change={_save}
							size={_ifSmall(size, 'sm', 'md')}
							validate
						/>
					{/each}
				</Fieldset>
			{/if}

			<FieldCheckbox
				label={t('hidden_label')}
				description={t('hidden_desc')}
				bind:checked={$_props.hidden}
				on:change={_save}
				size={_ifSmall(size, 'sm', 'md')}
				class={TYPE_TO_FIELD.checkbox.props.class}
			/>

			<!-- {#if !typeConfig?.allowInnerBlocks?.hidden && _typeExists($_type)} -->
			{#if _typeExists($_type)}
				<div class:opacity-50={typeConfig?.allowInnerBlocks?.hidden}>
					<FieldCheckbox
						label={t('allow_inner_label')}
						description={t('allow_inner_desc')}
						bind:checked={$_allowInnerBlocks}
						on:change={_save}
						disabled={typeConfig?.allowInnerBlocks?.hidden}
						size={_ifSmall(size, 'sm', 'md')}
						class={TYPE_TO_FIELD.checkbox.props.class}
					/>
				</div>
			{/if}

			<!-- <pre class="text-xs">{_stringify($value)}</pre> -->

			{#if showButtonEdit || showButtonClose || showButtonRemove || showIsSaving}
				<div
					class={twMerge(
						'space-x-2 mt-8 flex items-start justify-center',
						buttonBoxClass
					)}
				>
					<div class="flex-1">
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
					{#if $store?.isSaving}
						<div class="opacity-25">
							{@html iconHeroMiniArrowPath({
								class: twMerge('animate-spin m-auto inline')
							})}
						</div>
					{/if}
				</div>
			{/if}
		</form>
	{/key}
{/if}
