'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WelcomeOnboardingProps {
    isVisible: boolean;
    onComplete: () => void;
}

export function WelcomeOnboarding({ isVisible, onComplete }: WelcomeOnboardingProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0c] via-[#1a1a2e] to-[#0a0a0c] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="inline-block text-8xl mb-6"
                    >
                        💗
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-6xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 text-transparent bg-clip-text uppercase tracking-tighter"
                    >
                        Welcome to WhisperMatch
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xl text-gray-400 font-medium max-w-lg mx-auto leading-relaxed"
                    >
                        The first truly private, blockchain-powered dating platform
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="grid md:grid-cols-3 gap-6 mb-12"
                >
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">🔐</div>
                        <h3 className="text-lg font-black mb-2 text-white uppercase tracking-tight">Anonymous Funding</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Burn ETH from any wallet, mint LUV tokens to a fresh address. Truly untraceable.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">🌐</div>
                        <h3 className="text-lg font-black mb-2 text-white uppercase tracking-tight">Decentralized Profiles</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your data lives on IPFS and blockchain. No central servers, no data harvesting.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">✨</div>
                        <h3 className="text-lg font-black mb-2 text-white uppercase tracking-tight">Real Connections</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Premium profiles, structured prompts, and multi-photo galleries for genuine matches.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center"
                >
                    <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">Getting Started</h3>
                    <ol className="text-left space-y-3 mb-8 max-w-md mx-auto">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs font-black">1</span>
                            <span className="text-gray-300 font-medium text-sm">Connect your wallet with the button below</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-black">2</span>
                            <span className="text-gray-300 font-medium text-sm">Fund your account anonymously (0.01 ETH = 10 LUV)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-xs font-black">3</span>
                            <span className="text-gray-300 font-medium text-sm">Create your profile (costs 1 LUV)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs font-black">4</span>
                            <span className="text-gray-300 font-medium text-sm">Start discovering and matching!</span>
                        </li>
                    </ol>

                    <div className="flex gap-4 justify-center">
                        <ConnectButton />
                        <button
                            onClick={onComplete}
                            className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm uppercase tracking-wider"
                        >
                            Skip Intro
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
