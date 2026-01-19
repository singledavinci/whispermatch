'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CONTRACTS, MATCH_REGISTRY_ABI, MESSAGE_REGISTRY_ABI } from '@/lib/contracts';

export default function MatchesPage() {
    const { address, isConnected } = useAccount();
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');

    const { writeContract } = useWriteContract();

    // Get user's match count (we'd need to fetch actual matches in production)
    const { data: matchCount } = useReadContract({
        address: CONTRACTS.MatchRegistry,
        abi: MATCH_REGISTRY_ABI,
        functionName: 'getMatchCount',
        args: address ? [address] : undefined,
    });

    const sendMessage = async () => {
        if (!selectedMatch || !messageText.trim()) {
            alert('Please enter a message');
            return;
        }

        try {
            // In production, encrypt message and upload to IPFS
            const encryptedMessage = {
                text: messageText,
                timestamp: Date.now(),
                from: address,
            };

            // Simulate IPFS hash
            const ipfsHash = `Qm${btoa(JSON.stringify(encryptedMessage)).substring(0, 44)}`;

            writeContract({
                address: CONTRACTS.MessageRegistry,
                abi: MESSAGE_REGISTRY_ABI,
                functionName: 'sendMessage',
                args: [selectedMatch as `0x${string}`, ipfsHash],
                gas: BigInt(250000), // Explicit gas limit
            });

            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
                    <p className="text-gray-300 mb-8">Please connect to view your matches</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    // Mock matches for demo (in production, fetch from contract)
    const mockMatches = matchCount && Number(matchCount) > 0
        ? Array.from({ length: Number(matchCount) }, (_, i) => ({
            address: `0x${Math.random().toString(16).substring(2, 42)}`,
            name: `User ${i + 1}`,
            lastMessage: 'Hey! How are you?',
            timestamp: Date.now() - i * 3600000,
        }))
        : [];

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
                        <a href="/profile" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                            Profile
                        </a>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
                {mockMatches.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💔</div>
                            <h2 className="text-3xl font-bold text-white mb-4">No Matches Yet</h2>
                            <p className="text-gray-300 mb-8">Start swiping to find your match!</p>
                            <a
                                href="/browse"
                                className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                            >
                                Start Browsing
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        {/* Matches List */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <h2 className="text-2xl font-bold text-white">
                                    Matches ({mockMatches.length})
                                </h2>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                                {mockMatches.map((match, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => setSelectedMatch(match.address)}
                                        className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${selectedMatch === match.address ? 'bg-white/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {match.address.substring(0, 10)}...
                                                    </h3>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(match.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 truncate">
                                                    {match.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden flex flex-col">
                            {selectedMatch ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-6 border-b border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {selectedMatch.substring(0, 10)}...
                                                </h3>
                                                <p className="text-sm text-green-400">● Online</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                        {/* Demo messages */}
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 max-w-[70%]">
                                                <p className="text-white">Hey! Great profile! 😊</p>
                                                <span className="text-xs text-gray-400">10:30 AM</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-[70%]">
                                                <p className="text-white">Thanks! Your interests caught my eye 👀</p>
                                                <span className="text-xs text-white/70">10:32 AM</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 max-w-[70%]">
                                                <p className="text-white">Thanks! Do you like photography too?</p>
                                                <span className="text-xs text-gray-400">10:35 AM</span>
                                            </div>
                                        </div>

                                        {/* Encryption notice */}
                                        <div className="text-center">
                                            <div className="inline-block bg-blue-500/20 border border-blue-500/50 rounded-full px-4 py-2">
                                                <p className="text-blue-300 text-xs">
                                                    🔒 Messages encrypted and stored on IPFS
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-6 border-t border-white/20">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">💬</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Select a Match</h3>
                                        <p className="text-gray-400">Choose someone to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
