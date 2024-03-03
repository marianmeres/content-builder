<script lang="ts">
	import { Thc } from '@marianmeres/stuic';
	import { createClog } from '@marianmeres/clog';
	import type { ContentBuilderNodeValueTypesConfig } from '../ContentBuilder.svelte';
	import type { createContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';
	import { iconFeatherEdit } from '@marianmeres/icons-fns';

	const clog = createClog('ContentNodeValue');

	export let nodeTypesConfig: ContentBuilderNodeValueTypesConfig;
	export let value: ContentBuilderNodeValue;
	export let key: string;
	export let store: ReturnType<typeof createContentBuilderStore>;

	let input: HTMLInputElement;

	const submitLabel = (e: Event) => store.save();
</script>

<!-- <div> -->
{#if nodeTypesConfig?.[value.type]?.component}
	<Thc
		thc={{
			component: nodeTypesConfig?.[value.type]?.component,
			props: {
				...(nodeTypesConfig?.[value.type]?.props || {}),
				...(value.props || {}),
				key,
				value
			}
		}}
	/>
{:else}
	<!-- <ContentNodePreview {key} {value} {nodeTypesConfig} {store} /> -->
	<div class="flex items-center">
		<div class="flex-1">
			<input
				type="text"
				class="w-full focus:outline-none focus:bg-gray-100"
				bind:this={input}
				bind:value={value.label}
				on:blur={submitLabel}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						input.blur();
						submitLabel(e);
					}
				}}
			/>
		</div>
		<span
			class="
				text-xs font-mono rounded-full p-1 px-2 bg-gray-200
			"
		>
			<!-- {@html iconFeatherEdit({ size: 14, class: 'opacity-50' })} -->
			<!-- <span class="opacity-25">[{key}]</span> -->
			<span class="opacity-80">{value.type}</span>
		</span>
	</div>
{/if}
<!-- </div> -->
