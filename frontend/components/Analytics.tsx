import { analytics } from '@/lib/analytics';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        plausible: (...args: any[]) => void;
    }
}

/**
 * Google Analytics Script Component
 * Add to app/layout.tsx in <head>
 */
export function GoogleAnalytics() {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

    if (!GA_ID) return null;

    return (
        <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
                id="google-analytics"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_ID}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
        </>
    );
}

/**
 * Plausible Analytics Script Component
 * Privacy-friendly alternative to Google Analytics
 */
export function PlausibleAnalytics() {
    const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

    if (!DOMAIN) return null;

    return (
        <script
            defer
            data-domain={DOMAIN}
            src="https://plausible.io/js/script.js"
        />
    );
}

export { analytics };
