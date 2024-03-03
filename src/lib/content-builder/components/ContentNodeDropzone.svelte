<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { droppable } from '@marianmeres/stuic';
	import { writable } from 'svelte/store';
	import type { createContentBuilderStore } from '../content-builder.js';
	import { Tree } from '@marianmeres/tree';
	import type { ContentBuilderNodeValue } from '../types.js';

	const clog = createClog('Dropzone');

	export let index: number = 0;
	export let id: string = '';
	export let store: ReturnType<typeof createContentBuilderStore>;

	const isDraggedOver = writable<string | null>(null);

	const tree = new Tree<ContentBuilderNodeValue>();

	// $: clog(123, $store.data);
</script>

{#if id}
	<div
		use:droppable={{
			id,
			dropEffect: 'move',
			onDrop: (data, e) => {
				const sourceKey = data.payload?.source;
				const targetKey = id;
				let targetIndex = index;
				clog('onDrop', { sourceKey, targetKey, targetIndex });

				// @ts-ignore
				tree.restore($store.data);

				const src = tree.find(sourceKey);
				const target = tree.find(targetKey);

				// dragging under same parent needs some adjusting
				if (src?.parent === target) {
					// console.log('src', src?.siblingIndex, targetIndex);
					// dropped to top (special case -1 mark)
					if (targetIndex === -1) {
						targetIndex = 0;
					}
					// dragging upwards
					else if (src?.siblingIndex > targetIndex) {
						targetIndex++;
					}
					// console.log('final', src?.siblingIndex, targetIndex);
				}
				// not under same parent
				else {
					targetIndex++;
				}

				// if (targetIndex === -1) {
				// 	targetIndex = 0;
				// }

				console.log('final', src?.siblingIndex, targetIndex);
				store.move(sourceKey, targetKey, targetIndex);
			},
			isDraggedOver
			// logger: createClog('droppable')
		}}
		class:bg-black={$isDraggedOver === id}
		class:h-3={$isDraggedOver !== id}
		class:h-6={$isDraggedOver === id}
	/>
{/if}
