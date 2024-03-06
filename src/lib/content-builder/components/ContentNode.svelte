<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		iconFeatherCopy,
		iconFeatherFolderPlus,
		iconFeatherTrash2,
		iconBsGripVertical,
		iconFeatherEdit
	} from '@marianmeres/icons-fns';
	import {
		createAlertConfirmPromptStore,
		createConfirm,
		createPrompt,
		draggable,
		droppable
	} from '@marianmeres/stuic';
	import { Tree, type TreeNode } from '@marianmeres/tree';
	import { writable } from 'svelte/store';
	import { twMerge } from 'tailwind-merge';
	import type {
		ContentBuilderNodeValueTypesConfig,
		ContentBuilderTheme
	} from '../ContentBuilder.svelte';
	import type { createContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';
	import ContentNodeDropzone from './ContentNodeDropzone.svelte';
	import ContentNodeValue from './ContentNodeValue.svelte';
	import ControlButton from './ControlButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const clog = createClog('ContentNode');
	const dispatch = createEventDispatcher();

	// export let tree: Tree<ContentBuilderNodeValue>;
	export let node: TreeNode<ContentBuilderNodeValue> | null;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let hoveredKeys = writable<string[]>([]);
	export let t: CallableFunction;
	export let theme: Partial<ContentBuilderTheme>;
	export let nodeValueByTypeConfig: ContentBuilderNodeValueTypesConfig;
	export let disabled = false;
	export let acp: null | ReturnType<typeof createAlertConfirmPromptStore> = null;

	// for debug
	export let showNodeId = false;

	const onHover = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys, n.key];
	};

	const onHoverOut = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys.filter((k) => k !== n.key)];
	};

	const isDragged = writable<string | null>(null);
	const isDraggedOver = writable<string | null>(null);
	const tree = new Tree<ContentBuilderNodeValue>();

	// $: clog($isDraggedOver);
	// $: clog('node', node.key, node.depth);
	// $: clog($isDragged);
</script>

{#if node?.children?.length}
	<ol class="w-full" class:opacity-50={disabled} class:cursor-not-allowed={disabled}>
		{#each node?.children || [] as n, index (n.key)}
			{@const id = n.key}
			{@const isHovered = !disabled && $hoveredKeys.at(-1) === n.key}
			{#if !index}
				<!-- special case -1 signal -->
				<li><ContentNodeDropzone id={node?.key} {store} index={-1} {disabled} /></li>
			{/if}
			<li
				class:mx-8={!node.isRoot}
				class={twMerge(
					`select-none relative`,
					theme?.li || '',
					isHovered ? 'border-solid' : 'border-dashed',
					isHovered ? theme?.li_hi || 'border-black' : theme?.li_low || 'border-gray-400',
					`border relative block`,
					$isDraggedOver === id && ' border-black border-solid'
				)}
				on:pointerenter={() => onHover(n)}
				on:pointerleave={() => onHoverOut(n)}
				role="group"
			>
				<div
					use:draggable={{
						enabled: !disabled && isHovered,
						id,
						payload: { source: n.key },
						effectAllowed: 'move',
						isDragged
						// logger: createClog('draggable')
					}}
					class:cursor-grab={!disabled && $isDragged !== id}
					class:cursor-grabbing={!disabled && $isDragged === id}
					class:bg-gray-300={!disabled && $isDragged === id}
					use:droppable={{
						// this droppable only handles first child
						enabled: !!(n.value.allowInnerBlocks && !n.children?.length),
						id,
						onDrop: (data, e) => {
							const sourceKey = data.payload?.source;
							const targetKey = id;
							clog('onDrop', { sourceKey, targetKey });
							// @ts-ignore
							tree.restore($store.data);
							const src = tree.find(sourceKey);
							const target = tree.find(targetKey);
							// sanity check
							if (src && target && src !== target) {
								store.move(sourceKey, targetKey);
							}
						},
						isDraggedOver
					}}
				>
					<div class="flex w-full">
						<div
							class="flex flex-col justify-center p-0 opacity-40"
							class:hidden={disabled}
						>
							{@html iconBsGripVertical({ size: 21 })}
						</div>

						<div class="flex-1 p-2">
							<ContentNodeValue
								value={n.value}
								{nodeValueByTypeConfig}
								key={n.key}
								{store}
								{disabled}
								{showNodeId}
							/>
						</div>
					</div>

					{#if n.children?.length}
						<svelte:self
							node={n}
							{store}
							{hoveredKeys}
							{t}
							{theme}
							{nodeValueByTypeConfig}
							{disabled}
							{acp}
							{showNodeId}
							on:edit_request
						/>
					{/if}
				</div>

				{#if !disabled}
					<div
						class={twMerge(`
						absolute leading-none
						top-[100%] -right-[1px] z-10
						bg-black
						${theme?.hover_control?.box || ''}
						rounded-b
					`)}
						hidden={!isHovered}
					>
						<div class="flex items-center h-full">
							<ControlButton
								class="rounded-bl"
								ariaLabel={t('node_edit')}
								on:click={async () => {
									if (!acp) {
										clog.warn('acp instance not found, dispatching "edit_request"');
										dispatch('edit_request', { key: n.key, value: n.value });
									} else {
										store.resetError();
										const valueData = await createPrompt(acp)(
											'Valid JSON format is required.',
											JSON.stringify(n.value, null, 2),
											{
												promptFieldProps: {
													type: 'textarea',
													class: { input: 'font-mono' }
												},
												iconFn: false,
												title: 'Content block raw editor'
											}
										);
										// @ts-ignore
										store.edit(n.key, valueData);
									}
								}}
								{theme}
								{disabled}
							>
								{@html iconFeatherEdit({ size: 16 })}
							</ControlButton>
							{#if n.value.allowInnerBlocks}
								<ControlButton
									ariaLabel={t('node_add')}
									on:click={() => store.add(n.key)}
									{theme}
									{disabled}
								>
									{@html iconFeatherFolderPlus({ size: 16 })}
								</ControlButton>
							{/if}
							<ControlButton
								ariaLabel={t('node_duplicate')}
								on:click={() => store.duplicate(n.key)}
								{theme}
								{disabled}
							>
								{@html iconFeatherCopy({ size: 16 })}
							</ControlButton>
							<ControlButton
								ariaLabel={t('node_remove')}
								class="rounded-br"
								on:click={async () => {
									const c = acp
										? createConfirm(acp, { title: t('node_remove_confirm_title') })
										: confirm;
									if (await c(t('node_remove_confirm'))) {
										store.remove(n.key);
									}
								}}
								{theme}
								{disabled}
							>
								{@html iconFeatherTrash2({ size: 16 })}
							</ControlButton>
						</div>
					</div>
				{/if}
			</li>
			<li>
				<ContentNodeDropzone id={node.key} {store} {index} {disabled} />
			</li>
		{/each}
	</ol>
{/if}
