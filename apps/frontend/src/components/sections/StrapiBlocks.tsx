import React from "react";

interface Props {
	data: unknown;
	className?: string;
}

function extractBlocks(data: unknown): unknown[] {
	if (!data) return [];

	if (data === null || data === undefined) return [];

	if (typeof data === "string") {
		if (data.trim() === "") return [];
		return [{ type: "paragraph", children: [{ type: "text", text: data }] }];
	}

	if (Array.isArray(data)) {
		return data;
	}

	if (typeof data === "object" && data !== null) {
		const obj = data as Record<string, unknown>;

		if (obj.type === "root" && Array.isArray(obj.children)) {
			return obj.children as unknown[];
		}

		if (Array.isArray(obj.children)) {
			return obj.children as unknown[];
		}

		if (obj.type) {
			return [data];
		}
	}

	return [];
}

export default function StrapiBlocks({ data, className = "" }: Props) {
	const blocks = extractBlocks(data);

	if (blocks.length === 0) {
		return null;
	}

	return (
		<div className={`text-neutral-700 leading-relaxed space-y-4 ${className}`}>
			{blocks.map((block, index) => renderBlock(block, index))}
		</div>
	);
}

function renderBlock(block: unknown, key: number): React.ReactNode | null {
	if (!block || typeof block !== "object") return null;

	const b = block as Record<string, unknown>;
	const type = b.type as string | undefined;

	if (!type) {
		if (typeof b.text === "string") {
			return <p key={key}>{b.text}</p>;
		}
		return null;
	}

	switch (type) {
		case "paragraph":
			return (
				<p key={key} className="mb-4">
					{renderChildren(b.children)}
				</p>
			);

		case "heading": {
			const level = (b.level as number) || 2;
			const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
			return React.createElement(
				HeadingTag,
				{
					key,
					className: `font-bold ${getHeadingSize(level)} mb-4`,
				},
				renderChildren(b.children),
			);
		}

		case "list": {
			const format = b.format as string;
			const ListTag = format === "ordered" ? "ol" : "ul";
			const items = b.items as unknown[] | undefined;
			return React.createElement(
				ListTag,
				{
					key,
					className:
						format === "ordered"
							? "list-decimal pl-6 space-y-2"
							: "list-disc pl-6 space-y-2",
				},
				items?.map((item, i) => renderListItem(item, i)),
			);
		}

		case "image": {
			const image = b.image as Record<string, unknown> | undefined;
			if (image?.url) {
				return (
					<img
						key={key}
						src={image.url as string}
						alt={(image.alternativeText as string) || ""}
						className="rounded-xl w-full max-w-2xl mx-auto my-8"
					/>
				);
			}
			return null;
		}

		case "quote":
			return (
				<blockquote
					key={key}
					className="border-l-4 border-indigo-500 pl-4 italic my-6 text-neutral-600"
				>
					{renderChildren(b.children)}
				</blockquote>
			);

		case "code": {
			const children = b.children as Record<string, unknown>[] | undefined;
			const codeText = (children?.[0]?.text as string) || "";
			return (
				<pre
					key={key}
					className="bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto my-6 text-sm font-mono"
				>
					<code>{codeText}</code>
				</pre>
			);
		}

		default:
			return renderChildren(b.children, key);
	}
}

function renderListItem(item: unknown, key: number): React.ReactNode | null {
	if (!item || typeof item !== "object") return null;

	const i = item as Record<string, unknown>;
	const type = i.type as string | undefined;

	if (type === "list-item") {
		return (
			<li key={key} className="mb-1">
				{renderChildren(i.children)}
			</li>
		);
	}

	if (type === "paragraph") {
		return renderChildren(i.children);
	}

	if (type === "text") {
		return <li key={key}>{i.text as string}</li>;
	}

	return renderChildren(i.children, key);
}

function renderChildren(
	children: unknown,
	key?: number,
): React.ReactNode | null {
	if (!children) return null;

	if (!Array.isArray(children)) {
		if (typeof children === "object" && children !== null) {
			const c = children as Record<string, unknown>;

			if (c.type === "text") {
				return renderText(c, key ?? 0);
			}

			if (c.type === "paragraph") {
				return <span key={key}>{renderChildren(c.children)}</span>;
			}

			if (c.type === "list-item") {
				return <li key={key}>{renderChildren(c.children)}</li>;
			}

			if (c.type === "list") {
				return renderBlock(children, key ?? 0);
			}

			return renderBlock(children, key ?? 0);
		}
		return null;
	}

	return children.map((child, idx) => {
		const c = child as Record<string, unknown>;

		if (c.type === "text") {
			return renderText(c, key ?? idx);
		}

		if (c.type === "paragraph") {
			return (
				<React.Fragment key={key ?? idx}>
					{renderChildren(c.children)}
				</React.Fragment>
			);
		}

		return renderBlock(child, key ?? idx);
	});
}

function renderText(
	text: Record<string, unknown>,
	key: number,
): React.ReactNode {
	const textContent = text.text as string | undefined;
	if (!textContent) return null;

	let result: React.ReactNode = textContent;

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

	return <React.Fragment key={key}>{result}</React.Fragment>;
}

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
