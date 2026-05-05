export function pickWeighted<T>(items: T[], weightFn: (item: T) => number): T {
	if (items.length === 0) throw new Error("pickWeighted: items array must not be empty");
	const total = items.reduce((sum, item) => sum + weightFn(item), 0);
	let r = Math.random() * total;
	for (const item of items) {
		r -= weightFn(item);
		if (r <= 0) return item;
	}
	return items[items.length - 1];
}
