'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTRACTS, PROFILE_REGISTRY_ABI } from '@/lib/contracts';
import { resolveProfileMetadata, ProfileMetadata } from '@/lib/ipfs-utils';

// Pre-set avatar options
const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/big-smile/svg?seed=Happy',
    'https://api.dicebear.com/7.x/big-smile/svg?seed=Joy',
];

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const [bio, setBio] = useState('');
    const [age, setAge] = useState('');
    const [interests, setInterests] = useState('');
    const [minLuv, setMinLuv] = useState('1');
    const [imageUrl, setImageUrl] = useState('');
    const [uploadedImage, setUploadedImage] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [metadata, setMetadata] = useState<ProfileMetadata | null>(null);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    // Check if user has a profile
    const { data: hasProfile, refetch: refetchExists } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'profileExists',
        args: address ? [address] : undefined,
    });

    // Get user's profile if they have one
    const { data: profileData, refetch: refetchProfile } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
    });

    // Sync metadata and form fields
    useEffect(() => {
        const fetchMetadata = async () => {
            if (profileData && profileData[0]) {
                setIsLoadingMetadata(true);
                const result = await resolveProfileMetadata(profileData[0], address || '');
                setMetadata(result);

                // Pre-fill form fields
                setBio(result.description);
                setAge(result.age);
                setInterests(result.interests.join(', '));
                setImageUrl(result.image);

                setIsLoadingMetadata(false);
                setIsEditing(false); // Default to view mode if profile exists
            }
        };

        if (profileData) {
            fetchMetadata();
        } else if (hasProfile === false) {
            setIsEditing(true); // If no profile, we must be in create mode
        }
    }, [profileData, address, hasProfile]);

    useEffect(() => {
        if (isSuccess) {
            refetchExists();
            refetchProfile();
            setIsEditing(false);
        }
    }, [isSuccess]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setUploadedImage(base64);
                setImageUrl(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectAvatar = (avatarUrl: string) => {
        setImageUrl(avatarUrl);
        setUploadedImage('');
        setShowAvatarPicker(false);
    };

    const saveProfile = async () => {
        if (!bio || !age || !interests) {
            alert('Please fill all fields');
            return;
        }

        try {
            const demoMetadata = {
                bio,
                age: parseInt(age),
                interests: interests.split(',').map(i => i.trim()),
                imageUrl,
                timestamp: Date.now(),
            };

            const ipfsHash = `Qm${btoa(JSON.stringify(demoMetadata)).substring(0, 44)}`;

            if (hasProfile) {
                await writeContract({
                    address: CONTRACTS.ProfileRegistry,
                    abi: PROFILE_REGISTRY_ABI,
                    functionName: 'updateProfile',
                    args: [ipfsHash],
                    gas: BigInt(300000),
                });
            } else {
                await writeContract({
                    address: CONTRACTS.ProfileRegistry,
                    abi: PROFILE_REGISTRY_ABI,
                    functionName: 'createProfile',
                    args: [ipfsHash, BigInt(Math.floor(parseFloat(minLuv) * 1e18))],
                    gas: BigInt(500000),
                });
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#1a1a2e] to-[#0a0a0c] flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-pink-500 rounded-3xl m-auto mb-8 flex items-center justify-center text-4xl transform rotate-12">👤</div>
                    <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Identity Locked</h1>
                    <p className="text-gray-400 mb-8 font-medium">Connect your wallet to establish your anonymous presence.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    const displayImage = uploadedImage || imageUrl;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#12121a] to-[#0a0a0c] text-white">
            <header className="backdrop-blur-3xl bg-black/40 border-b border-white/5 fixed top-0 inset-x-0 z-50">
                <div className="container mx-auto px-8 py-5 flex justify-between items-center uppercase tracking-widest text-[10px] font-black">
                    <a href="/" className="text-xl bg-gradient-to-r from-pink-500 to-violet-600 text-transparent bg-clip-text">WhisperMatch</a>
                    <div className="flex items-center gap-8">
                        <a href="/browse" className="hover:text-pink-500 transition-colors">Discovery</a>
                        <a href="/matches" className="hover:text-pink-500 transition-colors">Matches</a>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit-mode"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">
                                            {hasProfile ? 'Update Identity' : 'Establish Identity'}
                                        </h1>
                                        <p className="text-pink-400 font-bold tracking-widest text-[10px] uppercase">
                                            Editing On-Chain Profile Data
                                        </p>
                                    </div>
                                    {hasProfile && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Left: Media Selection */}
                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <div className="aspect-square rounded-[2rem] overflow-hidden bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center transition-all group-hover:border-pink-500/50">
                                                {displayImage ? (
                                                    <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-6xl opacity-20 group-hover:opacity-100 transition-opacity">🖼️</span>
                                                )}
                                            </div>
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex-1 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-pink-500 hover:text-white transition-all"
                                                >
                                                    Upload Media
                                                </button>
                                                <button
                                                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                                    className="flex-1 py-3 bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                                                >
                                                    {showAvatarPicker ? 'Close' : 'Avatars'}
                                                </button>
                                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showAvatarPicker && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="grid grid-cols-4 gap-2 overflow-hidden"
                                                >
                                                    {AVATAR_OPTIONS.map((avatar, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={avatar}
                                                            onClick={() => selectAvatar(avatar)}
                                                            className="w-full aspect-square rounded-xl cursor-pointer border-2 border-transparent hover:border-pink-500 transition-all hover:scale-105"
                                                        />
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Right: Data Entry */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Age</label>
                                                <input
                                                    type="number"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-pink-500 outline-none font-bold"
                                                    placeholder="21"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Min LUV to View</label>
                                                <input
                                                    type="number"
                                                    value={minLuv}
                                                    onChange={(e) => setMinLuv(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-pink-500 outline-none font-bold"
                                                    placeholder="1.0"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Identity Tagline</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-pink-500 outline-none font-medium text-sm resize-none"
                                                placeholder="Write your anonymous bio..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Interests (Comma Separated)</label>
                                            <input
                                                type="text"
                                                value={interests}
                                                onChange={(e) => setInterests(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-pink-500 outline-none font-medium"
                                                placeholder="ZK Proofs, Art, Crypto"
                                            />
                                        </div>

                                        <button
                                            onClick={saveProfile}
                                            disabled={isPending}
                                            className="w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isPending ? 'Syncing to Blockchain...' : hasProfile ? 'Update Identity' : 'Anchor Identity (1 LUV)'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view-mode"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="flex justify-between items-center">
                                    <h1 className="text-6xl font-black uppercase tracking-tighter">Identity Core</h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-8 py-3 bg-pink-500 hover:bg-pink-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all active:scale-95"
                                    >
                                        Modify Signal
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Identity Card */}
                                    <div className="col-span-1">
                                        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                                            <div className="aspect-[4/5] relative">
                                                <img src={metadata?.image} className="w-full h-full object-cover grayscale-[30%]" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-8 left-8">
                                                    <p className="text-pink-400 font-black text-[10px] uppercase tracking-widest mb-1">Authenticated</p>
                                                    <h2 className="text-3xl font-black uppercase">{metadata?.name}, {metadata?.age}</h2>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                                    <span>Signal Integrity</span>
                                                    <span className="text-green-500">100% Verified</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="w-full h-full bg-pink-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Explorer */}
                                    <div className="col-span-2 space-y-8">
                                        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-6">Bio-Signal</h3>
                                            <p className="text-xl font-medium leading-relaxed italic text-white/90">"{metadata?.description}"</p>

                                            <div className="mt-10 flex flex-wrap gap-3">
                                                {metadata?.interests.map((interest, i) => (
                                                    <span key={i} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/70">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">View Cost</h4>
                                                <p className="text-3xl font-black">{((profileData?.[4] || 0n) === 0n ? 0 : Number(profileData?.[4]) / 1e18).toFixed(2)} <span className="text-sm text-pink-500">LUV</span></p>
                                            </div>
                                            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Discovery Date</h4>
                                                <p className="text-xl font-bold">{new Date(Number(profileData?.[1] || 0) * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-pink-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-purple-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 -z-10"></div>
        </div>
    );
}
