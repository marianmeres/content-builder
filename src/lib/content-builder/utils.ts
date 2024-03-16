export const escapeRegex = (str: string): string =>
	`${str}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const replaceMap = (str: string, map: Record<string, any>, ignoreCase = false) => {
	// normalize map to lower case keys if case insensitive
	// prettier-ignore
	if (ignoreCase) {
		map = Object.entries(map).reduce(
			(memo, [k, v]) => ({ ...memo, [k.toLowerCase()]: v }), {}
		);
	}

	let patterns: string[] = [];
	Object.keys(map).forEach((k) => patterns.push(escapeRegex(k)));
	let regExp = new RegExp(patterns.join('|'), 'g' + (ignoreCase ? 'i' : ''));
	return str.replace(regExp, (match) => {
		if (ignoreCase) {
			match = match.toLowerCase();
		}
		let replaced = typeof map[match] === 'function' ? map[match]() : map[match];
		if (replaced === null || replaced === void 0) {
			return '';
		}
		return replaced;
	});
};
