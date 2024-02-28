<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { Button, X, tooltip } from '@marianmeres/stuic';
	import type { TreeNode } from '@marianmeres/tree';
	import type { createContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';
	import { writable } from 'svelte/store';
	import {
		iconFeatherFolderPlus,
		iconFeatherPlus,
		iconFeatherTrash,
		iconFeatherTrash2
	} from '@marianmeres/icons-fns';
	import ControlButton from './ControlButton.svelte';

	const clog = createClog('ContentNode');

	// export let tree: Tree<ContentBuilderNodeValue>;
	export let node: TreeNode<ContentBuilderNodeValue> | null;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let hoveredKeys = writable<string[]>([]);
	export let t: CallableFunction;

	const onHover = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys, n.key];
	};

	const onHoverOut = (n: TreeNode<ContentBuilderNodeValue>) => {
		$hoveredKeys = [...$hoveredKeys.filter((k) => k !== n.key)];
	};

	// $: clog('node', node.key, node.depth);
	// $: clog($hoveredKeys);
</script>

{#if node?.children?.length}
	<ol class="">
		{#each node?.children || [] as n (n.key)}
			<li
				class:mx-8={!node.isRoot}
				class="my-2 border p-2 relative block"
				class:border-black={$hoveredKeys.at(-1) === n.key}
				on:mouseenter={() => onHover(n)}
				on:mouseleave={() => onHoverOut(n)}
				role="group"
			>
				{n.key}

				{#if n.children?.length}
					<svelte:self node={n} {store} {hoveredKeys} {t} />
				{/if}

				<div
					class="
						absolute leading-none
						top-[100%] -right-[1px] z-10
						text-sm
						bg-black rounded-b
					"
					hidden={$hoveredKeys.at(-1) !== n.key}
				>
					<div class="flex items-center h-full">
						<ControlButton
							ariaLabel={t('node_add')}
							on:click={() => store.add(n.key, { type: 'foo' })}
						>
							{@html iconFeatherFolderPlus({ size: 16 })}
						</ControlButton>
						<ControlButton
							ariaLabel={t('node_remove')}
							on:click={() => store.remove(n.key)}
						>
							{@html iconFeatherTrash2({ size: 16 })}
						</ControlButton>
					</div>
				</div>
			</li>
			<!-- <pre><ContentNode {node} /></pre> -->
		{/each}
	</ol>
{/if}
