'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface MatchCelebrationProps {
    isVisible: boolean;
    matchedProfile: {
        name: string;
        image: string;
    } | null;
    onClose: () => void;
}

export function MatchCelebration({ isVisible, matchedProfile, onClose }: MatchCelebrationProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && matchedProfile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, rotateY: -180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                        className="relative max-w-md w-full mx-6"
                    >
                        {/* Confetti Animation */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 0, opacity: 1 }}
                                    animate={{
                                        y: [-20, 400],
                                        x: [0, (Math.random() - 0.5) * 400],
                                        opacity: [1, 0],
                                        rotate: [0, Math.random() * 360],
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: Math.random() * 0.5,
                                        ease: 'easeOut',
                                    }}
                                    className="absolute top-1/2 left-1/2"
                                    style={{
                                        width: Math.random() * 10 + 5 + 'px',
                                        height: Math.random() * 10 + 5 + 'px',
                                        backgroundColor: ['#ec4899', '#a855f7', '#f43f5e', '#8b5cf6'][
                                            Math.floor(Math.random() * 4)
                                        ],
                                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Match Card */}
                        <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-rose-600 p-1 rounded-[2.5rem] shadow-2xl">
                            <div className="bg-black/90 backdrop-blur-xl rounded-[2.4rem] p-10 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="text-7xl mb-6"
                                >
                                    💗✨
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-4xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400 text-transparent bg-clip-text"
                                >
                                    It's a Match!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-white/70 font-medium mb-8 text-sm"
                                >
                                    You and <span className="text-pink-400 font-bold">{matchedProfile.name}</span> whispered the same signal
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="relative w-32 h-32 mx-auto mb-8"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-pulse" />
                                    <img
                                        src={matchedProfile.image}
                                        alt={matchedProfile.name}
                                        className="relative w-full h-full object-cover rounded-full border-4 border-white/20"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="space-y-3"
                                >
                                    <a
                                        href="/matches"
                                        className="block w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-pink-500/20 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                                    >
                                        Send Message
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="block w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-wider"
                                    >
                                        Keep Exploring
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
