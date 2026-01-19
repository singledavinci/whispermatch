'use client';

import { useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CONTRACTS, PROFILE_REGISTRY_ABI } from '@/lib/contracts';
import { resolveProfileMetadata, ProfileMetadata } from '@/lib/ipfs-utils';

interface ProfileCardProps {
    profileAddress: `0x${string}`;
    isActive: boolean;
    onLike: () => void;
    onSkip: () => void;
}

export function ProfileCard({ profileAddress, isActive, onLike, onSkip }: ProfileCardProps) {
    const [metadata, setMetadata] = useState<ProfileMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Fetch IPFS CID from contract
    const { data: profileData } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getProfile',
        args: [profileAddress],
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            if (profileData && profileData[0]) {
                const result = await resolveProfileMetadata(profileData[0], profileAddress);
                setMetadata(result);
                setIsLoading(false);
            }
        };

        if (profileAddress) {
            fetchMetadata();
        }
    }, [profileAddress, profileData]);

    if (!isActive) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={profileAddress}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, x: 100 }}
                className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            >
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-pink-300 font-medium animate-pulse text-sm uppercase tracking-widest">Decoding Profile...</p>
                    </div>
                ) : (
                    <>
                        {/* Profile Image Gallery */}
                        <div className="relative h-2/3 group">
                            <Image
                                src={metadata?.images?.[currentPhotoIndex] || metadata?.image || ''}
                                alt={metadata?.name || 'Profile'}
                                fill
                                className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                priority={currentPhotoIndex === 0}
                                sizes="(max-width: 768px) 100vw, 800px"
                            />

                            {/* Photo Navigation Dots */}
                            {metadata?.images && metadata.images.length > 1 && (
                                <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5 z-10">
                                    {metadata.images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPhotoIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all ${idx === currentPhotoIndex
                                                ? 'w-8 bg-white'
                                                : 'w-1.5 bg-white/40 hover:bg-white/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>

                            <div className="absolute bottom-6 left-8">
                                <h2 className="text-4xl font-black text-white tracking-tight">
                                    {metadata?.name}, <span className="text-pink-400">{metadata?.age}</span>
                                </h2>
                                <p className="text-white/70 font-medium flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {metadata?.location}
                                </p>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 p-8 bg-black/40">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {metadata?.interests.map((interest, i) => (
                                    <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 text-pink-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {interest}
                                    </span>
                                ))}
                            </div>

                            {/* Profile Prompts */}
                            {metadata?.prompts && metadata.prompts.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {metadata.prompts.map((prompt, i) => (
                                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-2">{prompt.question}</p>
                                            <p className="text-white font-medium text-sm leading-relaxed">{prompt.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-gray-300 leading-relaxed font-medium line-clamp-2 italic">
                                "{metadata?.description}"
                            </p>

                            <div className="mt-auto flex gap-4 pt-6">
                                <button
                                    onClick={onSkip}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    ✕ <span className="text-xs uppercase tracking-tighter">Pass</span>
                                </button>
                                <button
                                    onClick={onLike}
                                    className="flex-[2] py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-pink-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    💗 <span className="text-xs uppercase tracking-widest">Connect</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
