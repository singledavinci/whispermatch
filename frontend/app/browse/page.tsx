'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CONTRACTS, PROFILE_REGISTRY_ABI, MATCH_REGISTRY_ABI } from '@/lib/contracts';
import { ProfileCard } from '@/components/ProfileCard';
import { MatchCelebration } from '@/components/MatchCelebration';

export default function BrowsePage() {
    const { address, isConnected } = useAccount();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatchCelebration, setShowMatchCelebration] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState<{ name: string; image: string } | null>(null);

    const { writeContract } = useWriteContract();

    // Get all active profiles
    const { data: profiles, isLoading: isLoadingProfiles, refetch } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getActiveProfiles',
        args: address ? [address] : undefined,
    });

    const handleLike = async (profileAddress: `0x${string}`) => {
        try {
            writeContract({
                address: CONTRACTS.MatchRegistry,
                abi: MATCH_REGISTRY_ABI,
                functionName: 'sendLike',
                args: [profileAddress],
                gas: BigInt(200000),
            });

            // Simulate match detection (in real app, listen to MatchCreated event)
            // For demo, 30% chance of match
            if (Math.random() > 0.7 && profiles && profiles[currentIndex]) {
                // Fetch profile data for celebration
                setMatchedProfile({
                    name: 'Anonymous User', // Would be fetched from metadata
                    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'
                });
                setShowMatchCelebration(true);
            }

            // Move to next
            setCurrentIndex((prev) => prev + 1);
        } catch (error) {
            console.error('Error sending like:', error);
        }
    };

    const handleSkip = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#1a1a2e] to-[#0a0a0c] flex flex-col">
                <header className="p-6">
                    <a href="/" className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
                        WHISPERMATCH
                    </a>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl">
                        <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-3xl m-auto mb-8 flex items-center justify-center shadow-lg transform rotate-12">
                            <span className="text-5xl -rotate-12">🔐</span>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4">Discovery Secured</h1>
                        <p className="text-gray-400 mb-10 leading-relaxed font-medium">
                            Connect your wallet to begin exploring anonymous matches on the blockchain.
                        </p>
                        <div className="transform scale-110">
                            <ConnectButton label="Unlock Discovery" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#12121a] to-[#0a0a0c] text-white">
            {/* Navigation Header */}
            <header className="backdrop-blur-3xl bg-black/40 border-b border-white/5 fixed top-0 inset-x-0 z-50">
                <div className="container mx-auto px-8 py-5 flex justify-between items-center uppercase tracking-widest text-[10px] font-black">
                    <a href="/" className="text-xl bg-gradient-to-r from-pink-500 to-violet-600 text-transparent bg-clip-text">
                        WhisperMatch
                    </a>
                    <div className="flex items-center gap-8">
                        <a href="/profile" className="hover:text-pink-500 transition-colors">My Identity</a>
                        <a href="/matches" className="hover:text-pink-500 transition-colors">Matches</a>
                        <div className="h-4 w-[1px] bg-white/10"></div>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Main Visual Content */}
            <main className="container mx-auto px-6 pt-32 pb-12 flex flex-col items-center justify-center min-h-screen">
                <div className="relative w-full max-w-md h-[38rem]">
                    {isLoadingProfiles ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-4 border-r-2 border-purple-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
                                <div className="absolute inset-8 border-t-2 border-rose-400 rounded-full animate-spin [animation-duration:2s]"></div>
                            </div>
                            <p className="mt-8 text-pink-300 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Chain...</p>
                        </div>
                    ) : !profiles || profiles.length === 0 ? (
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center justify-center p-12 text-center">
                            <div className="text-6xl mb-6 grayscale opacity-50">🏜️</div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">The Void is Quiet</h2>
                            <p className="text-gray-400 font-medium text-sm leading-relaxed mb-10">
                                You are the pioneer. No other active profiles meet your privacy criteria yet.
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="px-8 py-3 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all transform active:scale-95"
                            >
                                Re-Scan Network
                            </button>
                        </div>
                    ) : currentIndex >= (profiles?.length || 0) ? (
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center justify-center p-12 text-center">
                            <div className="text-6xl mb-6">🌌</div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Event Horizon Reached</h2>
                            <p className="text-gray-400 font-medium text-sm leading-relaxed mb-10">
                                You've explored every encrypted signal in your vicinity. Check back later for new arrivals.
                            </p>
                            <button
                                onClick={() => setCurrentIndex(0)}
                                className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pink-500/20 hover:scale-105 transition-all active:scale-95"
                            >
                                Loop Back
                            </button>
                        </div>
                    ) : (
                        profiles && (
                            <ProfileCard
                                key={profiles[currentIndex]}
                                profileAddress={profiles[currentIndex]}
                                isActive={true}
                                onLike={() => handleLike(profiles[currentIndex])}
                                onSkip={handleSkip}
                            />
                        )
                    )}
                </div>

                {/* Progress Indicators */}
                {profiles && profiles.length > 0 && currentIndex < profiles.length && (
                    <div className="mt-8 flex gap-1.5 backdrop-blur-md bg-black/40 p-2 rounded-full border border-white/5 shadow-inner">
                        {profiles.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-8 bg-pink-500' : 'w-1.5 bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-pink-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-purple-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 -z-10"></div>

            {/* Match Celebration Modal */}
            <MatchCelebration
                isVisible={showMatchCelebration}
                matchedProfile={matchedProfile}
                onClose={() => setShowMatchCelebration(false)}
            />
        </div>
    );
}
