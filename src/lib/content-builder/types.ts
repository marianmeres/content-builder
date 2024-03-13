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
	inputType?: 'text' | 'textarea' | 'select' | 'radio' | 'hidden';
	inputOptions?: (string | { label: string; value: string })[]; // for selects, radios
	value: any;
	inputProps?: Record<string, any> & {
		placeholder?: string;
	};
}

export interface ContentNodeEditorTypeConfig {
	value: string;
	label?: string;
	description?: string;
	props?: ContentNodeEditorTypeConfigProp[];
	allowInnerBlocks?: {
		value: boolean;
		hidden: boolean;
	};
}
