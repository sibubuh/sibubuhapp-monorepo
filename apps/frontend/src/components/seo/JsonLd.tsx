/**
 * Renders a JSON-LD block. Structured data is valid anywhere in the document,
 * so rendering it in the body keeps this usable from any component on React 18
 * (which does not hoist tags into <head> the way React 19 does).
 */
export default function JsonLd({ data }: { data: unknown }) {
	if (!data) return null;

	return (
		<script
			type="application/ld+json"
			// Escaping "<" stops a string value such as "</script>" from closing
			// the tag early.
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
