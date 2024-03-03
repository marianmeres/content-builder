<script lang="ts">
	import type { ContentBuilderNodeValue } from '../../lib/content-builder/types.js';

	let _class = '';
	export { _class as class };

	export let key: string;
	export let value: ContentBuilderNodeValue;
</script>

<div class="flex items-center">
	<span class={`flex-1 font-mono ${_class}`}>{value.label}</span>
	<span class="text-xs font-mono opacity-50 pl-2">{key}</span>
</div>
