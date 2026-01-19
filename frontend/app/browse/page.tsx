'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CONTRACTS, PROFILE_REGISTRY_ABI, MATCH_REGISTRY_ABI } from '@/lib/contracts';

export default function BrowsePage() {
    const { address, isConnected } = useAccount();
    const [currentIndex, setCurrentIndex] = useState(0);

    const { writeContract } = useWriteContract();

    // Get all active profiles
    const { data: profiles } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getActiveProfiles',
        args: address ? [address] : undefined,
    });

    const sendLike = async (profileAddress: string) => {
        try {
            writeContract({
                address: CONTRACTS.MatchRegistry,
                abi: MATCH_REGISTRY_ABI,
                functionName: 'sendLike',
                args: [profileAddress as `0x${string}`],
                gas: BigInt(200000), // Explicit gas limit
            });

            // Move to next profile
            setCurrentIndex((prev) => prev + 1);
        } catch (error) {
            console.error('Error sending like:', error);
        }
    };

    const skipProfile = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
                    <p className="text-gray-300 mb-8">Please connect to browse profiles</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    const currentProfile = profiles && profiles.length > 0 && currentIndex < profiles.length
        ? profiles[currentIndex]
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900">
            {/* Header */}
            <header className="backdrop-blur-md bg-black/20 border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                        💗 WhisperMatch
                    </a>
                    <div className="flex gap-4">
                        <a href="/profile" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                            My Profile
                        </a>
                        <a href="/matches" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                            Matches
                        </a>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
                {!profiles || profiles.length === 0 ? (
                    <div className="text-center">
                        <div className="text-6xl mb-4">😢</div>
                        <h2 className="text-3xl font-bold text-white mb-4">No Profiles Found</h2>
                        <p className="text-gray-300 mb-8">Be the first to create a profile!</p>
                        <a
                            href="/profile"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                        >
                            Create Profile
                        </a>
                    </div>
                ) : currentIndex >= profiles.length ? (
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-white mb-4">You've Seen Everyone!</h2>
                        <p className="text-gray-300 mb-8">Check back later for new profiles</p>
                        <button
                            onClick={() => setCurrentIndex(0)}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                        >
                            Start Over
                        </button>
                    </div>
                ) : (
                    <div className="max-w-md w-full">
                        <motion.div
                            key={currentIndex}
                            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
                        >
                            {/* Profile Image Placeholder */}
                            <div className="h-96 bg-gradient-to-br from-pink-500/40 to-purple-600/40 flex items-center justify-center">
                                <div className="text-9xl">👤</div>
                            </div>

                            {/* Profile Info */}
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white">
                                        {currentProfile?.substring(0, 8)}...
                                    </h2>
                                    <span className="text-gray-400 text-sm">
                                        {currentIndex + 1} / {profiles.length}
                                    </span>
                                </div>

                                <p className="text-gray-300 mb-4">
                                    Profile stored on IPFS - decentralized and private
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                                        Photography
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                        Travel
                                    </span>
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                        Music
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={skipProfile}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all duration-300"
                                    >
                                        ✕ Skip
                                    </button>
                                    <button
                                        onClick={() => currentProfile && sendLike(currentProfile)}
                                        className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                                    >
                                        💗 Like
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Swipe Hint */}
                        <p className="text-center text-gray-400 text-sm mt-4">
                            Swipe right to like, left to skip
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
