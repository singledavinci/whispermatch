/**
 * Analytics tracking utility
 * Supports Google Analytics and Plausible Analytics
 */

// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Plausible Analytics
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

interface EventParams {
    action: string;
    category: string;
    label?: string;
    value?: number;
}

/**
 * Track custom events
 */
export const trackEvent = ({ action, category, label, value }: EventParams) => {
    // Google Analytics
    if (GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }

    // Plausible Analytics (custom events)
    if (PLAUSIBLE_DOMAIN && typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(action, {
            props: { category, label, value },
        });
    }
};

/**
 * Track page views
 */
export const trackPageView = (url: string) => {
    if (GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

/**
 * WhisperMatch-specific event tracking
 */
export const analytics = {
    profileCreated: () => {
        trackEvent({
            action: 'profile_created',
            category: 'engagement',
        });
    },

    profileLiked: () => {
        trackEvent({
            action: 'profile_liked',
            category: 'engagement',
        });
    },

    matchCreated: () => {
        trackEvent({
            action: 'match_created',
            category: 'engagement',
        });
    },

    messageSent: () => {
        trackEvent({
            action: 'message_sent',
            category: 'engagement',
        });
    },

    ethBurned: (amount: number) => {
        trackEvent({
            action: 'eth_burned',
            category: 'transaction',
            value: amount,
        });
    },

    luvMinted: (amount: number) => {
        trackEvent({
            action: 'luv_minted',
            category: 'transaction',
            value: amount,
        });
    },

    walletConnected: (walletType: string) => {
        trackEvent({
            action: 'wallet_connected',
            category: 'connection',
            label: walletType,
        });
    },
};
