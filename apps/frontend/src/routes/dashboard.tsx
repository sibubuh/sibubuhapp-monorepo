import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
    component: DashboardPage,
});

function DashboardPage() {
    const [health, setHealth] = React.useState<{ ok: boolean; ts: string } | null>(null);

    React.useEffect(() => {
        fetch("/api/health")
            .then((r) => r.json())
            .then((data) => setHealth(data))
            .catch(() => setHealth({ ok: false, ts: new Date().toISOString() }));
    }, []);

    return (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="font-semibold text-3xl tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
                A simple client-side fetch against a Start server route.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">/api/health</p>
                        <p className="text-muted-foreground text-sm">Server route</p>
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                            health?.ok
                                ? "bg-accent text-accent-foreground"
                                : "bg-destructive/10 text-destructive"
                        }`}
                    >
                        {health ? (health.ok ? "OK" : "DEGRADED") : "LOADING"}
                    </span>
                </div>
                {health ? (
                    <p className="mt-4 font-mono text-muted-foreground text-sm">
                        ts={health.ts}
                    </p>
                ) : null}
            </div>
        </main>
    );
}
