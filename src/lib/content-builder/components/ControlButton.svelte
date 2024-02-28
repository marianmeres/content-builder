<script lang="ts">
	import { tooltip } from '@marianmeres/stuic';

	export let ariaLabel = '';
</script>

<button
	class="px-3 py-2 hover:underline text-white/80 hover:text-white"
	on:click
	aria-label={ariaLabel}
	use:tooltip
>
	<slot />
</button>
