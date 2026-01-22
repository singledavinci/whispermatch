'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 30 seconds on first visit
            setTimeout(() => {
                const hasSeenInstallPrompt = localStorage.getItem('whispermatch_install_prompt_seen');
                if (!hasSeenInstallPrompt) {
                    setShowPrompt(true);
                }
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('whispermatch_install_prompt_seen', 'true');
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('whispermatch_install_prompt_seen', 'true');
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50"
            >
                <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 p-1 rounded-2xl shadow-2xl">
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">📱</div>
                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg mb-1">
                                    Add to Home Screen
                                </h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    Install WhisperMatch for quick access and better performance!
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform"
                                    >
                                        Install
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="py-2 px-4 bg-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/20 transition-colors"
                                    >
                                        Not Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
