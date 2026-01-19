'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseEther, keccak256, encodePacked } from 'viem';
import { CONTRACTS, BURN_MINT_ABI } from '@/lib/contracts';

export default function FundPage() {
    const { address, isConnected } = useAccount();
    const [step, setStep] = useState<'burn' | 'wait' | 'mint'>('burn');
    const [ethAmount, setEthAmount] = useState('0.1');
    const [secret, setSecret] = useState('');
    const [newWalletAddress, setNewWalletAddress] = useState('');
    const [commitmentHash, setCommitmentHash] = useState<`0x${string}` | null>(null);

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    // Persist funding state to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('whispermatch_funding_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.secret) setSecret(parsed.secret);
            if (parsed.newWalletAddress) setNewWalletAddress(parsed.newWalletAddress);
            if (parsed.commitmentHash) setCommitmentHash(parsed.commitmentHash);
            if (parsed.ethAmount) setEthAmount(parsed.ethAmount);
            if (parsed.step) setStep(parsed.step);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('whispermatch_funding_state', JSON.stringify({
            secret,
            newWalletAddress,
            commitmentHash,
            ethAmount,
            step
        }));
    }, [secret, newWalletAddress, commitmentHash, ethAmount, step]);

    const generateSecret = () => {
        const randomSecret = `whispermatch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        setSecret(randomSecret);
    };

    const handleBurnAndCommit = async () => {
        if (!ethAmount || !secret || !newWalletAddress) {
            alert('Please fill all fields');
            return;
        }

        try {
            const amount = parseEther(ethAmount);
            const secretHash = keccak256(encodePacked(['string'], [secret]));
            const commitment = keccak256(
                encodePacked(
                    ['bytes32', 'address', 'uint256'],
                    [secretHash, newWalletAddress as `0x${string}`, amount]
                )
            );

            setCommitmentHash(commitment);

            writeContract({
                address: CONTRACTS.BurnMint,
                abi: BURN_MINT_ABI,
                functionName: 'burnAndCommit',
                args: [commitment],
                value: amount,
                gas: BigInt(300000), // Explicit gas limit
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Transaction failed');
        }
    };

    const handleMintWithProof = async () => {
        if (!commitmentHash || !secret || !newWalletAddress) {
            alert('Missing data for minting');
            return;
        }

        try {
            const amount = parseEther(ethAmount);
            const secretHash = keccak256(encodePacked(['string'], [secret]));

            writeContract({
                address: CONTRACTS.BurnMint,
                abi: BURN_MINT_ABI,
                functionName: 'mintWithProof',
                args: [secretHash, newWalletAddress as `0x${string}`, amount],
                gas: BigInt(500000), // Explicit gas limit
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Minting failed');
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
                    <p className="text-gray-300 mb-8">Please connect your wallet to fund anonymously</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900">
            {/* Header */}
            <header className="backdrop-blur-md bg-black/20 border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                        💗 WhisperMatch
                    </a>
                    <ConnectButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Anonymous Funding</h1>
                    <p className="text-gray-300 mb-8">
                        Burn ETH from your public wallet and mint LUV tokens to a fresh, unlinkable address using zero-knowledge proofs.
                    </p>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-12">
                        <Step number={1} title="Burn & Commit" active={step === 'burn'} completed={step !== 'burn'} />
                        <div className="flex-1 h-0.5 bg-white/20 mx-4" />
                        <Step number={2} title="Wait 10 Blocks" active={step === 'wait'} completed={step === 'mint'} />
                        <div className="flex-1 h-0.5 bg-white/20 mx-4" />
                        <Step number={3} title="Mint LUV" active={step === 'mint'} />
                    </div>

                    {/* Form */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                        {step === 'burn' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-white font-semibold mb-2">ETH Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={ethAmount}
                                        onChange={(e) => setEthAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                        placeholder="0.1"
                                    />
                                    <p className="text-sm text-gray-400 mt-1">
                                        You'll receive {(parseFloat(ethAmount) * 1000).toFixed(0)} LUV tokens
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-white font-semibold mb-2">Secret (Keep this safe!)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={secret}
                                            onChange={(e) => setSecret(e.target.value)}
                                            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                            placeholder="Your secret phrase"
                                        />
                                        <button
                                            onClick={generateSecret}
                                            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    <p className="text-sm text-yellow-400 mt-1">⚠️ Save this secret! You'll need it to mint LUV.</p>
                                </div>

                                <div>
                                    <label className="block text-white font-semibold mb-2">New Wallet Address (Recipient)</label>
                                    <input
                                        type="text"
                                        value={newWalletAddress}
                                        onChange={(e) => setNewWalletAddress(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                        placeholder="0x..."
                                    />
                                    <p className="text-sm text-gray-400 mt-1">LUV will be minted to this fresh address</p>
                                </div>

                                <button
                                    onClick={handleBurnAndCommit}
                                    disabled={isPending || !ethAmount || !secret || !newWalletAddress}
                                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? 'Burning...' : `Burn ${ethAmount} ETH & Commit`}
                                </button>

                                {isSuccess && (
                                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                                        <p className="text-green-300">✅ ETH burned successfully!</p>
                                        <button
                                            onClick={() => setStep('wait')}
                                            className="mt-2 text-white underline"
                                        >
                                            Continue to next step →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'wait' && (
                            <div className="text-center space-y-6">
                                <div className="text-6xl mb-4">⏳</div>
                                <h2 className="text-2xl font-bold text-white">Waiting for 10 Blocks...</h2>
                                <p className="text-gray-300">
                                    This delay ensures maximum privacy by preventing timing analysis attacks.
                                </p>
                                <p className="text-sm text-gray-400">
                                    Commitment: {commitmentHash?.substring(0, 20)}...
                                </p>
                                <button
                                    onClick={() => setStep('mint')}
                                    className="mt-6 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                                >
                                    I've waited 10 blocks, proceed to mint →
                                </button>
                            </div>
                        )}

                        {step === 'mint' && (
                            <div className="space-y-6">
                                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                                    <p className="text-blue-300">
                                        🔒 Anyone can call the mint function - your privacy is preserved!
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-white font-semibold mb-2">Your Secret</label>
                                    <input
                                        type="text"
                                        value={secret}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white font-semibold mb-2">Recipient Address</label>
                                    <input
                                        type="text"
                                        value={newWalletAddress}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white font-semibold mb-2">Amount</label>
                                    <input
                                        type="text"
                                        value={`${ethAmount} ETH → ${(parseFloat(ethAmount) * 1000).toFixed(0)} LUV`}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <button
                                    onClick={handleMintWithProof}
                                    disabled={isPending}
                                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50"
                                >
                                    {isPending ? 'Minting...' : 'Mint LUV Tokens 🎉'}
                                </button>

                                {isSuccess && (
                                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                                        <p className="text-green-300 mb-2">✅ LUV minted successfully!</p>
                                        <p className="text-gray-300 text-sm">
                                            Your {(parseFloat(ethAmount) * 1000).toFixed(0)} LUV has been sent to {newWalletAddress.substring(0, 10)}...
                                        </p>
                                        <a
                                            href="/profile"
                                            className="inline-block mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            Create Your Profile →
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function Step({ number, title, active, completed }: { number: number; title: string; active?: boolean; completed?: boolean }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${completed
                    ? 'bg-green-500 text-white'
                    : active
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-white/10 text-gray-400'
                    }`}
            >
                {completed ? '✓' : number}
            </div>
            <span className={`text-sm mt-2 ${active ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {title}
            </span>
        </div>
    );
}
