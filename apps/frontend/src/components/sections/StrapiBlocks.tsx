import React from "react";

interface Props {
	data: unknown;
	className?: string;
}

export default function StrapiBlocks({ data, className = "" }: Props) {
	const blocks = extractBlocks(data).filter((b) => !isEmptyBlock(b));

	if (blocks.length === 0) return null;

	return (
		<div className={`text-neutral-700 leading-relaxed space-y-4 ${className}`}>
			{blocks.map((block, i) => renderBlock(block, i))}
		</div>
	);
}

//
// ✅ Extract blocks safely
//
function extractBlocks(data: unknown): any[] {
	if (!data) return [];

	if (typeof data === "string") {
		return [
			{
				type: "paragraph",
				children: [{ type: "text", text: data }],
			},
		];
	}

	if (Array.isArray(data)) return data;

	if (typeof data === "object" && data !== null) {
		const obj = data as any;

		if (obj.type === "root" && Array.isArray(obj.children)) {
			return obj.children;
		}

		if (Array.isArray(obj.children)) {
			return obj.children;
		}

		return [obj];
	}

	return [];
}

//
// ✅ Remove empty blocks
//
function isEmptyBlock(block: any): boolean {
	if (!block?.children) return false;

	return block.children.every(
		(child: any) =>
			child.type === "text" && (!child.text || child.text.trim() === "")
	);
}

//
// 🔥 MAIN BLOCK RENDERER
//
function renderBlock(block: any, key: number): React.ReactNode {
	if (!block || typeof block !== "object") return null;

	const { type } = block;

	switch (type) {
		case "paragraph":
			return (
				<p key={key} className="mb-4">
					{renderChildren(block.children)}
				</p>
			);

		case "heading": {
			const level = block.level || 2;
			const Tag = `h${level}` as keyof JSX.IntrinsicElements;

			return (
				<Tag key={key} className={`font-bold mb-4 ${getHeadingSize(level)}`}>
					{renderChildren(block.children)}
				</Tag>
			);
		}

		// ✅ LIST (supports nesting)
		case "list": {
			const format = block.format;
			const Tag = format === "ordered" ? "ol" : "ul";

			return (
				<Tag
					key={key}
					className={
						format === "ordered"
							? "list-decimal pl-6 space-y-2 [&_ul]:mt-2 [&_ol]:mt-2"
							: "list-disc pl-6 space-y-2 [&_ul]:mt-2 [&_ol]:mt-2"
					}
				>
					{block.children?.map((child: any, i: number) =>
						renderBlock(child, i)
					)}
				</Tag>
			);
		}

		// ✅ LIST ITEM (handles nested list inside)
		case "list-item":
			return (
				<li key={key} className="mb-1">
					{renderChildren(block.children)}
				</li>
			);

		case "quote":
			return (
				<blockquote
					key={key}
					className="border-l-4 border-indigo-500 pl-4 italic my-6 text-neutral-600"
				>
					{renderChildren(block.children)}
				</blockquote>
			);

		case "code": {
			const text = block.children?.[0]?.text || "";
			return (
				<pre
					key={key}
					className="bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto my-6 text-sm font-mono"
				>
					<code>{text}</code>
				</pre>
			);
		}

		case "image": {
			const image = block.image;
			if (!image?.url) return null;

			return (
				<img
					key={key}
					src={image.url}
					alt={image.alternativeText || ""}
					className="rounded-xl w-full max-w-2xl mx-auto my-8"
				/>
			);
		}

		default:
			return renderChildren(block.children);
	}
}

//
// ✅ CHILDREN RENDERER (CRITICAL FOR NESTING)
//
function renderChildren(children: any): React.ReactNode {
	if (!children) return null;

	if (!Array.isArray(children)) {
		return renderBlock(children, 0);
	}

	return children.map((child, i) => {
		if (child.type === "text") {
			return renderText(child, i);
		}

		return renderBlock(child, i);
	});
}

//
// ✅ INLINE TEXT RENDERER
//
function renderText(text: any, key: number): React.ReactNode {
	if (!text.text) return null;

	let result: React.ReactNode = text.text;

	if (text.bold) result = <strong className="font-bold">{result}</strong>;
	if (text.italic) result = <em className="italic">{result}</em>;
	if (text.underline) result = <span className="underline">{result}</span>;
	if (text.strikethrough)
		result = <del className="line-through">{result}</del>;

	if (text.code) {
		result = (
			<code className="bg-neutral-100 px-1 rounded text-sm font-mono text-indigo-600">
				{result}
			</code>
		);
	}

	// ✅ LINK SUPPORT
	if (text.url) {
		result = (
			<a
				href={text.url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-indigo-600 underline hover:text-indigo-500"
			>
				{result}
			</a>
		);
	}

	return <React.Fragment key={key}>{result}</React.Fragment>;
}

//
// ✅ HEADING SIZES
//
function getHeadingSize(level: number): string {
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
