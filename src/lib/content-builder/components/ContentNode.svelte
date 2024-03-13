<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		iconBsGripVertical,
		iconFeatherCopy,
		iconFeatherEdit,
		iconFeatherFolderPlus,
		iconFeatherTrash2
	} from '@marianmeres/icons-fns';
	import {
		createAlertConfirmPromptStore,
		createConfirm,
		draggable,
		droppable,
		tooltip
	} from '@marianmeres/stuic';
	import { Tree, type TreeNode } from '@marianmeres/tree';
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	import { twMerge } from 'tailwind-merge';
	import type { ContentBuilderTheme } from '../ContentBuilder.svelte';
	import type { ContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';
	import ContentNodeDropzone from './ContentNodeDropzone.svelte';
	import ContentNodeValue from './ContentNodeValue.svelte';
	import ControlButton from './ControlButton.svelte';
	import Debug from './Debug.svelte';

	const clog = createClog('ContentNode');
	const dispatch = createEventDispatcher();

	// export let tree: Tree<ContentBuilderNodeValue>;
	export let node: TreeNode<ContentBuilderNodeValue> | null;
	export let store: ContentBuilderStore;
	export let hoveredKeys = writable<string[]>([]);
	export let t: CallableFunction;
	export let theme: Partial<ContentBuilderTheme>;
	export let disabled = false;
	export let acp: null | ReturnType<typeof createAlertConfirmPromptStore> = null;

	export let onNodeEditRequest: (
		key: string,
		value: ContentBuilderNodeValue
	) => Promise<boolean | undefined>;

	// for debug
	export let showNodeId = false;
	export let highlightedNodeKey: string | undefined | null = undefined;
	export let debug = false;

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
	const _isDropzoneEnabled = (n: TreeNode<ContentBuilderNodeValue>) => {
		// if...
		return (
			// root is always droppable, or
			n.isRoot ||
			// is explicitly allowed
			node?.value?.allowInnerBlocks
		);
	};
</script>

{#if node?.children?.length}
	<ol class="w-full" class:opacity-50={disabled} class:cursor-not-allowed={disabled}>
		{#each node?.children || [] as n, index (n.key)}
			{@const id = n.key}
			{@const isHovered = !disabled && $hoveredKeys.at(-1) === n.key}
			{#if !index}
				<!-- special case -1 signal -->
				<li>
					<Debug {node} {debug} dropzoneEnabled={_isDropzoneEnabled(node)} />
					<ContentNodeDropzone
						id={node?.key}
						{store}
						index={-1}
						disabled={disabled || !_isDropzoneEnabled(node)}
					/>
				</li>
			{/if}
			<li
				class:mx-4={!node.isRoot}
				class={twMerge(
					`select-none relative`,
					theme?.li || '',
					isHovered ? 'border-solid' : 'border-dashed',
					isHovered ? theme?.li_hi || 'border-black' : theme?.li_low || 'border-gray-300',
					`border-[3px] rounded-t rounded-l relative block`,
					$isDraggedOver === id && ' border-black border-solid'
				)}
				on:pointerenter={() => onHover(n)}
				on:pointerleave={() => onHoverOut(n)}
				role="group"
				data-content-builder-node-hidden={n.value?.props?.hidden ? true : undefined}
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
							// clog('onDrop', { sourceKey, targetKey });
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
					data-content-builder-node-highlighted={highlightedNodeKey === n.key
						? true
						: undefined}
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
								key={n.key}
								{store}
								{disabled}
								{showNodeId}
								{onNodeEditRequest}
								{t}
							/>
						</div>
					</div>

					{#if n.children?.length}
						<div class={!n.value.allowInnerBlocks ? 'text-red-500' : ''}>
							<svelte:self
								node={n}
								{store}
								{hoveredKeys}
								{t}
								{theme}
								{disabled}
								{acp}
								{showNodeId}
								{onNodeEditRequest}
								{highlightedNodeKey}
								{debug}
							/>
						</div>
					{/if}
				</div>

				{#if !disabled}
					<div
						class={twMerge(`
						absolute leading-none
						top-[100%] -right-[3px] z-10
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
								on:click={async () => onNodeEditRequest(n.key, n.value)}
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
										? createConfirm(acp, {
												title: t('node_remove_confirm_title'),
												variant: 'warn'
											})
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
			<li
				data-content-builder-node-debug={JSON.stringify({
					isRoot: node.isRoot,
					parentIsRoot: node.parent?.isRoot,
					parentAllowInnerBlocks: node.parent?.value?.allowInnerBlocks
				})}
			>
				<Debug {node} {debug} dropzoneEnabled={_isDropzoneEnabled(node)} />
				<ContentNodeDropzone
					id={node.key}
					{store}
					{index}
					disabled={disabled || !_isDropzoneEnabled(node)}
				/>
			</li>
		{/each}
	</ol>
{/if}
