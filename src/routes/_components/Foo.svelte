<script lang="ts">
	export let key: string = '';
	export let type: string = '';

	export let style: string = '';
	export let foo: string = 'must be overwritten 1';
</script>

<div class="foo" {style} id={key} data-content-builder-type={type}>
	<div>
		foo {foo}
	</div>
	<slot />
</div>

<style>
	.foo {
		color: var(--foo-color, 'purple');
	}
</style>
