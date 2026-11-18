import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThirdPartyScripts from "../../src/components/ui/ThirdPartyScripts";

function injectedSrcs(): string[] {
	return [...document.head.querySelectorAll("script[src]")].map(
		(node) => (node as HTMLScriptElement).src,
	);
}

describe("ThirdPartyScripts", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		document.head.innerHTML = "";
		// Exercise the Safari path; requestIdleCallback is covered separately.
		vi.stubGlobal("requestIdleCallback", undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("injects nothing before the browser goes idle", () => {
		render(<ThirdPartyScripts gaId="G-TEST" adsensePubId="ca-pub-test" />);

		expect(injectedSrcs()).toEqual([]);
	});

	it("loads analytics and ads once idle", () => {
		render(<ThirdPartyScripts gaId="G-TEST" adsensePubId="ca-pub-test" />);
		vi.advanceTimersByTime(2000);

		const srcs = injectedSrcs().join(" ");
		expect(srcs).toContain("googletagmanager.com/gtag/js?id=G-TEST");
		expect(srcs).toContain("adsbygoogle.js?client=ca-pub-test");
	});

	it("skips whichever id the CMS has not set", () => {
		render(<ThirdPartyScripts gaId="G-TEST" adsensePubId={null} />);
		vi.advanceTimersByTime(2000);

		const srcs = injectedSrcs().join(" ");
		expect(srcs).toContain("googletagmanager.com");
		expect(srcs).not.toContain("adsbygoogle");
	});

	it("does nothing at all when both ids are missing", () => {
		render(<ThirdPartyScripts gaId={null} adsensePubId={null} />);
		vi.advanceTimersByTime(5000);

		expect(document.head.innerHTML).toBe("");
	});

	it("does not inject after unmount", () => {
		const { unmount } = render(
			<ThirdPartyScripts gaId="G-TEST" adsensePubId="ca-pub-test" />,
		);
		unmount();
		vi.advanceTimersByTime(5000);

		expect(injectedSrcs()).toEqual([]);
	});

	it("uses requestIdleCallback when the browser has one", () => {
		const idle = vi.fn((cb: IdleRequestCallback) => {
			cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
			return 1;
		});
		vi.stubGlobal("requestIdleCallback", idle);

		render(<ThirdPartyScripts gaId="G-TEST" adsensePubId={null} />);

		expect(idle).toHaveBeenCalledOnce();
		expect(injectedSrcs().join(" ")).toContain("googletagmanager.com");
	});
});
