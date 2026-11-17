import { Calendar, MessageCircle, Tag } from "lucide-react";
import { motion } from "motion/react";
import { sanitizeHtml } from "../../../libs/sanitize";
import { STRAPI_CMS_BASE_URL } from "../../../config/strapi";
import type { Story } from "../../../types/story";

/** Uploads are served by Strapi, not by this app's origin. */
function mediaUrl(url?: string): string | undefined {
	if (!url) return undefined;
	if (/^https?:\/\//i.test(url)) return url;
	return `${STRAPI_CMS_BASE_URL ?? ""}${url}`;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export default function StoryDetail({ story }: { story: Story }) {
	const thumbnail = mediaUrl(story.thumbnail?.url);
	// Imported bodies point at Strapi's /uploads; rewrite them to absolute URLs
	// so the images resolve from this app's origin too.
	const content = sanitizeHtml(
		story.content.replace(/(src|href)="\/uploads\//g, `$1="${STRAPI_CMS_BASE_URL ?? ""}/uploads/`),
	);

	return (
		<article className="bg-background">
			<header className="px-6 pt-24 pb-10 md:pt-32">
				<div className="mx-auto max-w-3xl">
					<div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" />
							{formatDate(story.publishedDate)}
						</span>
						{story.commentCount > 0 && (
							<span className="inline-flex items-center gap-1.5">
								<MessageCircle className="h-3.5 w-3.5" />
								{story.commentCount}
							</span>
						)}
						{story.author && <span>{story.author}</span>}
					</div>

					<motion.h1
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="font-serif text-3xl font-medium leading-tight text-foreground md:text-5xl"
					>
						{story.title}
					</motion.h1>

					{story.excerpt && (
						<p className="mt-5 text-lg leading-relaxed text-muted-foreground">
							{story.excerpt}
						</p>
					)}

					{story.labels?.length > 0 && (
						<div className="mt-6 flex flex-wrap gap-2">
							{story.labels.map((label) => (
								<span
									key={label}
									className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
								>
									<Tag className="h-3 w-3" />
									{label}
								</span>
							))}
						</div>
					)}
				</div>
			</header>

			{thumbnail && (
				<div className="px-6">
					<div className="mx-auto max-w-4xl overflow-hidden rounded-xl shadow-card">
						<img
							src={thumbnail}
							alt={story.title}
							className="h-full w-full object-cover"
						/>
					</div>
				</div>
			)}

			<div className="px-6 py-12 md:py-16">
				{/* Blogger markup carries its own inline styles; `story-body` only
				    supplies the typography the imported HTML never had. */}
				<div
					className="story-body mx-auto max-w-3xl text-base leading-relaxed text-foreground"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised above
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>
		</article>
	);
}
