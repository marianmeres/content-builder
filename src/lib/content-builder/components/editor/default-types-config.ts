import type { ContentNodeEditorTypeConfig } from '../../types.js';

export const defaultTypesConfig: ContentNodeEditorTypeConfig[] = [
	{
		// option name
		label: 'Default',
		// option value
		value: 'default',
		// ui form config... (probably subset of the actual component props)
		description: '',
		props: [
			{
				name: 'html',
				// type: 'string', // string is default
				inputType: 'textarea',
				value: '',
				inputProps: {
					placeholder: '<b>Hello, World!</b>'
				}
			},
			{
				name: 'style',
				inputType: 'textarea',
				value: '',
				inputProps: {
					placeholder: 'color: red;'
				}
			}
		],
		allowInnerBlocks: {
			value: true,
			hidden: false
		}
	},
	{
		label: 'Flexible space',
		value: 'flexible_space',
		description: "Expands height respecting parent's block available space",
		props: [
			{
				name: 'html',
				inputType: 'hidden',
				value: ''
			},
			{
				name: 'style',
				inputType: 'hidden',
				value: 'flex-grow: 1;'
			}
		],
		allowInnerBlocks: {
			value: false,
			hidden: true
		}
	}
];
