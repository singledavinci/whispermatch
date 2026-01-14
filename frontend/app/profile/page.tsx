'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CONTRACTS, PROFILE_REGISTRY_ABI } from '@/lib/contracts';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    // Check if user has a profile
    const { data: hasProfile } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'profileExists',
        args: address ? [address] : undefined,
    });

    // Get user's profile if they have one
    const { data: profileData } = useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Convert to base64 for demo (in production, upload to IPFS/Pinata)
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

    const createProfile = async () => {
        if (!bio || !age || !interests) {
            alert('Please fill all fields');
            return;
        }

        try {
            // In a real app, upload to IPFS
            const profileData = {
                bio,
                age: parseInt(age),
                interests: interests.split(',').map(i => i.trim()),
                imageUrl,
                timestamp: Date.now(),
            };

            // Simulate IPFS hash (in production, use actual IPFS upload)
            const ipfsHash = `Qm${btoa(JSON.stringify(profileData)).substring(0, 44)}`;

            await writeContract({
                address: CONTRACTS.ProfileRegistry,
                abi: PROFILE_REGISTRY_ABI,
                functionName: 'createProfile',
                args: [ipfsHash, BigInt(Math.floor(parseFloat(minLuv) * 1e18))],
                gas: BigInt(500000), // Explicit gas limit
            });
        } catch (error) {
            console.error('Error creating profile:', error);
            alert(`Profile creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const updateProfile = async () => {
        if (!bio) {
            alert('Please enter your bio');
            return;
        }

        try {
            const profileData = {
                bio,
                age: parseInt(age),
                interests: interests.split(',').map(i => i.trim()),
                imageUrl,
                timestamp: Date.now(),
            };

            const ipfsHash = `Qm${btoa(JSON.stringify(profileData)).substring(0, 44)}`;

            await writeContract({
                address: CONTRACTS.ProfileRegistry,
                abi: PROFILE_REGISTRY_ABI,
                functionName: 'updateProfile',
                args: [ipfsHash],
                gas: BigInt(300000), // Explicit gas limit
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
                    <p className="text-gray-300 mb-8">Please connect to create your profile</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    const displayImage = uploadedImage || imageUrl;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900">
            {/* Header */}
            <header className="backdrop-blur-md bg-black/20 border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                        💗 WhisperMatch
                    </a>
                    <div className="flex gap-4">
                        <a href="/browse" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                            Browse
                        </a>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {hasProfile ? 'Your Profile' : 'Create Your Profile'}
                    </h1>
                    <p className="text-gray-300 mb-8">
                        {hasProfile
                            ? 'Update your dating profile stored on IPFS'
                            : 'Share your interests and find your match! Requires at least 1 LUV token.'
                        }
                    </p>

                    {/* Profile Form */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 space-y-6">

                        {/* Profile Image Section */}
                        <div>
                            <label className="block text-white font-semibold mb-3">Profile Picture</label>

                            {/* Current image preview */}
                            <div className="flex justify-center mb-4">
                                {displayImage ? (
                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        src={displayImage}
                                        alt="Profile preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-xl"
                                        onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_OPTIONS[0]; }}
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl">
                                        👤
                                    </div>
                                )}
                            </div>

                            {/* Image selection buttons */}
                            <div className="flex gap-3 flex-wrap justify-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    📤 Upload Photo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    🎨 Choose Avatar
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Avatar picker */}
                            {showAvatarPicker && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 grid grid-cols-4 gap-3"
                                >
                                    {AVATAR_OPTIONS.map((avatar, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selectAvatar(avatar)}
                                            className="relative group"
                                        >
                                            <img
                                                src={avatar}
                                                alt={`Avatar ${idx + 1}`}
                                                className="w-full aspect-square rounded-full border-2 border-white/20 hover:border-pink-500 transition-all cursor-pointer hover:scale-110"
                                            />
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            <p className="text-sm text-gray-400 mt-2 text-center">
                                Choose an avatar or upload your own photo
                            </p>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-white font-semibold mb-2">Age *</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                placeholder="25"
                                min="18"
                                max="100"
                                required
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-white font-semibold mb-2">Bio *</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                                placeholder="Tell us about yourself... What makes you unique?"
                                required
                            />
                            <p className="text-sm text-gray-400 mt-1">{bio.length}/500 characters</p>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-white font-semibold mb-2">Interests (comma-separated) *</label>
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                placeholder="Photography, Travel, Music, Cooking"
                                required
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {interests.split(',').filter(i => i.trim()).map((interest, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                                        {interest.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Min LUV to View */}
                        {!hasProfile && (
                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Minimum LUV Required to View Your Profile
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={minLuv}
                                    onChange={(e) => setMinLuv(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                    placeholder="1"
                                    min="0"
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    Set this higher to ensure only serious users can see you
                                </p>
                            </div>
                        )}

                        {/* Error Display */}
                        {writeError && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-300 text-sm">
                                    ❌ Error: {writeError.message}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={hasProfile ? updateProfile : createProfile}
                            disabled={isPending || !bio || !age || !interests}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending
                                ? 'Processing Transaction...'
                                : hasProfile
                                    ? 'Update Profile'
                                    : 'Create Profile (Requires 1 LUV)'
                            }
                        </button>

                        {isSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
                            >
                                <p className="text-green-300 mb-2">
                                    ✅ Profile {hasProfile ? 'updated' : 'created'} successfully!
                                </p>
                                <a
                                    href="/browse"
                                    className="inline-block mt-2 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Start Browsing Profiles →
                                </a>
                            </motion.div>
                        )}

                        {/* Privacy Notice */}
                        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                            <p className="text-blue-300 text-sm">
                                🔒 <strong>Your Privacy Matters:</strong> Your profile is stored on IPFS, fully decentralized.
                                Only users with the required LUV balance can view it.
                            </p>
                        </div>
                    </div>

                    {/* Profile Preview */}
                    {hasProfile && profileData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Current Profile</h2>
                            <div className="space-y-2 text-gray-300">
                                <p><strong>IPFS Hash:</strong> {profileData[0]?.substring(0, 20)}...</p>
                                <p><strong>Created:</strong> {new Date(Number(profileData[1]) * 1000).toLocaleDateString()}</p>
                                <p><strong>Last Updated:</strong> {new Date(Number(profileData[2]) * 1000).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {profileData[3] ? '🟢 Active' : '🔴 Inactive'}</p>
                                <p><strong>Min LUV to View:</strong> {(Number(profileData[4]) / 1e18).toFixed(2)} LUV</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
