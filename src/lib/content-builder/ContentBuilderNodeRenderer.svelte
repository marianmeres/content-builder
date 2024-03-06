<script context="module" lang="ts">
	export interface ContentBuilderRendererComponentDef {
		component: any;
		props?: Record<string, any>;
	}
</script>

<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import type { TreeNode } from '@marianmeres/tree';
	import Default from './components/renderer/Default.svelte';
	import type { ContentBuilderNodeValue } from './types.js';

	export let typeToComponentMap: Record<string, ContentBuilderRendererComponentDef> = {};
	export let node: TreeNode<ContentBuilderNodeValue> | null;

	// $: clog(123, node?.isRoot);
	const getCmp = (key: string, value: ContentBuilderNodeValue) => ({
		component: typeToComponentMap?.[value.type]?.component || Default,
		props: {
			key,
			type: value.type,
			...(typeToComponentMap?.[value.type]?.props || {}),
			...(value?.props || {})
		}
	});
</script>

{#if node?.isRoot}
	<div data-content-builder-type={node.value.type}>
		{#each node?.children || [] as child}
			<svelte:self node={child} {typeToComponentMap} />
		{/each}
	</div>
{:else if node}
	{@const cmp = getCmp(node.key, node.value)}
	<!-- {#key node.key} -->
	<!-- {node.key} -->
	<svelte:component this={cmp.component} {...cmp?.props || {}}>
		{#each node?.children || [] as child}
			<svelte:self node={child} {typeToComponentMap} />
		{/each}
	</svelte:component>
	<!-- {/key} -->
{/if}
