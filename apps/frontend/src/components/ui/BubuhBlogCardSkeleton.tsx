import { motion } from "motion/react";

interface BlogCardSkeletonProps {
	count?: number;
}

export default function BlogCardSkeleton({ count = 6 }: BlogCardSkeletonProps) {
	return (
		<>
			{Array.from({ length: count }).map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: i * 0.05 }}
					className="bg-card rounded-xl overflow-hidden border border-border"
				>
					<div className="aspect-[16/10] bg-muted animate-pulse" />
					<div className="p-5 space-y-3">
						<div className="flex gap-3">
							<div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
							<div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
						</div>
						<div className="h-5 bg-muted rounded animate-pulse" />
						<div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
						<div className="space-y-2 pt-2">
							<div className="h-4 bg-muted rounded animate-pulse" />
							<div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
						</div>
					</div>
				</motion.div>
			))}
		</>
	);
}
