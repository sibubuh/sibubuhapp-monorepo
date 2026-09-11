import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function LoginPage() {
    const [email, setEmail] = React.useState("");

    return (
        <main className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="font-semibold text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-muted-foreground">
                Demo form only (no auth wired).
            </p>

            <form className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
                <label className="block text-sm font-sans">
                    <span className="text-muted-foreground">Email</span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        type="email"
                        placeholder="you@company.com"
                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 font-sans outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                </label>

                <button
                    type="button"
						className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 font-sans text-sm font-medium text-background transition-colors hover:bg-ink hover:text-ink-foreground"
                    onClick={() => alert(`Hello, ${email || "friend"}!`)}
                >
                    Continue
                </button>
            </form>
        </main>
    );
}
