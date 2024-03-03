export interface ContentBuilderNodeValue {
	type: string;
	label?: string;
	html?: string;
	props?: Record<string, any>;
	allowChildren?: boolean;
}
