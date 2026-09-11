const ContactCTA = () => (
	<section className="border-t border-border bg-secondary px-6 py-20 text-secondary-foreground md:py-28">
		<div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-12 lg:gap-16">
			<div className="lg:col-span-7">
				<h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
					Have a project in mind?
				</h2>
				<p className="mt-5 max-w-md font-sans text-lg leading-relaxed text-muted-foreground">
					Tell me what you are building and I will tell you how I can help.
				</p>
			</div>
			<div className="lg:col-span-5 lg:justify-self-end">
				<a
					href="mailto:nchan.bkho@gmail.com"
					className="inline-flex items-center gap-2 rounded-md bg-foreground px-7 py-3.5 font-sans text-sm font-medium text-background hover:text-ink-foreground transition-colors hover:bg-ink"
				>
					Let&rsquo;s Talk
					<span aria-hidden="true">&rarr;</span>
				</a>
				<p className="mt-4 font-sans text-sm text-muted-foreground">
					nchan.bkho@gmail.com
				</p>
			</div>
		</div>
	</section>
);

export { ContactCTA as default };
