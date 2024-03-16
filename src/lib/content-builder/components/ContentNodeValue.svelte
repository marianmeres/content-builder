<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import type { ContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';
	import { tooltip } from '@marianmeres/stuic';

	const clog = createClog('ContentNodeValue');

	export let value: ContentBuilderNodeValue;
	export let key: string;
	export let store: ContentBuilderStore;
	export let disabled = false;
	export let t: CallableFunction;
	// for debug
	export let showNodeId = false;
	export let onNodeEditRequest: (
		key: string,
		value: ContentBuilderNodeValue
	) => Promise<boolean | undefined>;

	let input: HTMLInputElement;

	//
	let _previousLabel = value.label;
	const submitLabel = (e: Event) => {
		if (_previousLabel !== value.label) {
			store.save();
			_previousLabel = value.label;
		}
	};
</script>

<div class="flex items-center">
	<div class="flex-1 pr-2">
		<input
			type="text"
			class="
				w-full
				bg-transparent
				focus:outline-none focus:bg-gray-100 hover:bg-gray-50 focus:border-none focus:ring-0
				border-none p-0 text-base
				ring-0
			"
			class:cursor-not-allowed={disabled}
			bind:this={input}
			bind:value={value.label}
			on:blur={submitLabel}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					input.blur();
					submitLabel(e);
				}
			}}
			{disabled}
		/>
	</div>
	{#if showNodeId}
		<span class="text-xs font-mono opacity-50 mr-2">{key}</span>
	{/if}
	<!-- use:tooltip -->
	<button
		class="
			text-xs font-mono rounded-full p-1 px-2 bg-gray-100
		"
		on:click={async () => onNodeEditRequest(key, value)}
		type="button"
		aria-label={t('node_edit_drag')}
	>
		<span class="opacity-75">{value.type}</span>
	</button>
</div>
