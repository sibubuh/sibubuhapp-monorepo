interface Props {
	data: unknown;
	className?: string;
}

export default function StrapiBlocks({ data, className = "" }: Props) {
	if (!data) return null;

	const blocks = Array.isArray(data) ? data : [data];

	return (
		<div className={`text-neutral-700 leading-relaxed space-y-4 ${className}`}>
			{blocks.map((block, index) => renderBlock(block, index))}
		</div>
	);
}

function renderBlock(block: any, key: number) {
	if (!block || !block.type) return null;

	switch (block.type) {
		case "paragraph":
			return (
				<p key={key} className="mb-4">
					{renderChildren(block.children)}
				</p>
			);

		case "heading":
			const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
			return (
				<HeadingTag
					key={key}
					className={`font-bold ${getHeadingSize(block.level)} mb-4`}
				>
					{renderChildren(block.children)}
				</HeadingTag>
			);

		case "list":
			const ListTag = block.format === "ordered" ? "ol" : "ul";
			return (
				<ListTag
					key={key}
					className={
						block.format === "ordered"
							? "list-decimal pl-6 space-y-2"
							: "list-disc pl-6 space-y-2"
					}
				>
					{block.items?.map((item: any, i: number) => renderBlock(item, i))}
				</ListTag>
			);

		case "list-item":
			return <li key={key}>{renderChildren(block.children)}</li>;

		case "image":
			return block.image?.url ? (
				<img
					key={key}
					src={block.image.url}
					alt={block.image.alternativeText || ""}
					className="rounded-xl w-full max-w-2xl mx-auto my-8"
				/>
			) : null;

		case "quote":
			return (
				<blockquote
					key={key}
					className="border-l-4 border-indigo-500 pl-4 italic my-6 text-neutral-600"
				>
					{renderChildren(block.children)}
				</blockquote>
			);

		case "code":
			return (
				<pre
					key={key}
					className="bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto my-6 text-sm"
				>
					<code>{block.children?.[0]?.text || ""}</code>
				</pre>
			);

		default:
			return renderChildren(block.children, key);
	}
}

function renderChildren(children: any[], key?: number) {
	if (!children) return null;

	return children.map((child, i) => {
		if (child.type === "text") {
			return renderText(child, key ?? i);
		}
		return renderBlock(child, key ?? i);
	});
}

function renderText(text: any, key: number) {
	if (!text.text) return null;

	let result: React.ReactNode = text.text;

	if (text.bold) result = <strong className="font-bold">{result}</strong>;
	if (text.italic) result = <em className="italic">{result}</em>;
	if (text.underline) result = <span className="underline">{result}</span>;
	if (text.code)
		result = (
			<code className="bg-neutral-100 px-1 rounded text-sm font-mono text-indigo-600">
				{result}
			</code>
		);
	if (text.strikethrough) result = <del className="line-through">{result}</del>;

	return <span key={key}>{result}</span>;
}

function getHeadingSize(level: number) {
	const sizes: Record<number, string> = {
		1: "text-5xl md:text-6xl",
		2: "text-4xl md:text-5xl",
		3: "text-3xl md:text-4xl",
		4: "text-2xl md:text-3xl",
		5: "text-xl md:text-2xl",
		6: "text-lg md:text-xl",
	};
	return sizes[level] || sizes[2];
}
