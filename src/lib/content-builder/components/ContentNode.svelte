<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		iconFeatherCopy,
		iconFeatherFolderPlus,
		iconFeatherTrash2,
		iconBsGripVertical,
		iconFeatherEdit
	} from '@marianmeres/icons-fns';
	import { draggable } from '@marianmeres/stuic';
	import type { TreeNode } from '@marianmeres/tree';
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

	const clog = createClog('ContentNode');

	// export let tree: Tree<ContentBuilderNodeValue>;
	export let node: TreeNode<ContentBuilderNodeValue> | null;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let hoveredKeys = writable<string[]>([]);
	export let t: CallableFunction;
	export let theme: Partial<ContentBuilderTheme>;
	export let nodeTypesConfig: ContentBuilderNodeValueTypesConfig;

	const onHover = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys, n.key];
	};

	const onHoverOut = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys.filter((k) => k !== n.key)];
	};

	const isDragged = writable<string | null>(null);

	// $: clog('node', node.key, node.depth);
	// $: clog($isDragged);
</script>

{#if node?.children?.length}
	<ol class="w-full">
		{#each node?.children || [] as n, index (n.key)}
			{@const id = n.key}
			{@const isHovered = $hoveredKeys.at(-1) === n.key}
			{#if !index}
				<!-- spacial case -1 signal -->
				<li><ContentNodeDropzone id={node?.key} {store} index={-1} /></li>
			{/if}
			<li
				class:mx-8={!node.isRoot}
				class={twMerge(
					`select-none`,
					theme?.li || '',
					isHovered ? 'border-solid' : 'border-dashed',
					isHovered ? theme?.li_hi || 'border-black' : theme?.li_low || 'border-gray-400',
					`border relative block`
				)}
				class:border-solid={isHovered}
				on:pointerenter={() => onHover(n)}
				on:pointerleave={() => onHoverOut(n)}
				role="group"
			>
				<!-- class:opacity-25={$isDragged?.[id]} -->
				<div
					use:draggable={{
						enabled: isHovered,
						id,
						payload: { source: n.key },
						effectAllowed: 'move',
						isDragged
						// logger: createClog('draggable')
					}}
					class:cursor-grab={$isDragged !== id}
					class:cursor-grabbing={$isDragged === id}
					class:bg-gray-300={$isDragged === id}
				>
					<div class="flex w-full">
						<div class="flex flex-col justify-center p-0 opacity-50">
							{@html iconBsGripVertical({ size: 21 })}
						</div>

						<div class="flex-1 p-2">
							<ContentNodeValue value={n.value} {nodeTypesConfig} key={n.key} {store} />
						</div>
						<div class="flex flex-col justify-center p-0 opacity-50">
							{@html iconBsGripVertical({ size: 21 })}
						</div>
					</div>

					{#if n.children?.length}
						<svelte:self node={n} {store} {hoveredKeys} {t} {theme} {nodeTypesConfig} />
					{/if}
				</div>

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
							on:click={() => store.duplicate(n.key)}
							{theme}
						>
							{@html iconFeatherEdit({ size: 16 })}
						</ControlButton>
						{#if n.value.allowChildren}
							<ControlButton
								class="rounded-bl"
								ariaLabel={t('node_add')}
								on:click={() =>
									store.add(n.key, {
										type: n.value.type,
										label: [n.value.type, ' #', store.counter()].join(''),
										allowChildren: n.value.allowChildren
									})}
								{theme}
							>
								{@html iconFeatherFolderPlus({ size: 16 })}
							</ControlButton>
						{/if}
						<ControlButton
							class={n.value.allowChildren ? '' : 'rounded-bl'}
							ariaLabel={t('node_duplicate')}
							on:click={() => store.duplicate(n.key)}
							{theme}
						>
							{@html iconFeatherCopy({ size: 16 })}
						</ControlButton>
						<ControlButton
							ariaLabel={t('node_remove')}
							class="rounded-br"
							on:click={async () => {
								if (await confirm(t('node_remove_confirm'))) {
									store.remove(n.key);
								}
							}}
							{theme}
						>
							{@html iconFeatherTrash2({ size: 16 })}
						</ControlButton>
					</div>
				</div>
				<!-- <ContentNodeDropzone {id} /> -->
				<!-- <ContentNodeDropzone {id} {store} index={index + 1} /> -->
			</li>
			<li>
				<!-- <ContentNodeDropzone id={node.parent?.key || node.key} {store} {index} /> -->
				<ContentNodeDropzone id={node.key} {store} {index} />
			</li>
		{/each}
		<!-- {#if node.isRoot}
			<li>
				<ContentNodeDropzone id={node.key} {store} index={Number.MAX_SAFE_INTEGER} />
			</li>
		{/if} -->
	</ol>
{/if}
