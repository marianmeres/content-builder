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
	}
];
