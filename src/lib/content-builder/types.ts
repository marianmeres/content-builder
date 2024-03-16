export interface ContentBuilderNodeValue {
	type: string;
	label?: string;
	html?: string;
	props?: Record<string, any>;
	allowInnerBlocks?: boolean;
}

export interface ContentNodeEditorTypeConfigProp {
	name: string;
	type?: 'string' | 'number' | 'boolean' | 'date';
	inputType?: 'text' | 'textarea' | 'select' | 'radio' | 'hidden' | 'checkbox';
	value: any;
	inputProps?: Record<string, any> & {
		placeholder?: string;
		options?: (
			| string
			| { label: string; value: string; description?: string; optgroup?: string }
		)[]; // for selects, radios
	};
}

export interface ContentNodeEditorTypeConfig {
	value: string;
	label?: string;
	description?: string;
	optgroup?: string;
	props?: ContentNodeEditorTypeConfigProp[];
	allowInnerBlocks?: {
		value: boolean;
		hidden: boolean;
	};
}
