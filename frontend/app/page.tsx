'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { WelcomeOnboarding } from '@/components/WelcomeOnboarding';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('whispermatch_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('whispermatch_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text"
          >
            💗 WhisperMatch
          </motion.div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Privacy-First
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                Web3 Dating
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find your match anonymously with zero-knowledge proofs, decentralized profiles, and encrypted messaging.
            </p>

            {!isConnected ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                    >
                      Get Started →
                    </button>
                  )}
                </ConnectButton.Custom>
              </motion.div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Link href="/fund">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
                  >
                    Anonymous Funding
                  </motion.button>
                </Link>
                <Link href="/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    My Profile
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <FeatureCard
              icon="🔒"
              title="Anonymous Funding"
              description="Burn ETH from your public wallet and mint LUV tokens to a fresh address with zero-knowledge proofs"
              delay={0.2}
            />
            <FeatureCard
              icon="🌐"
              title="Decentralized Profiles"
              description="Your photos and bio stored on IPFS. You own your data, not a corporation."
              delay={0.4}
            />
            <FeatureCard
              icon="💬"
              title="Private Matching"
              description="Swipe, match, and chat with complete privacy. Only matched users can message."
              delay={0.6}
            />
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-24 text-center"
          >
            <p className="text-gray-400 mb-4">Built with cutting-edge Web3 technology</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Foundry</span>
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Next.js 16</span>
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">RainbowKit</span>
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">IPFS</span>
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Zero-Knowledge</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Welcome Onboarding */}
      <WelcomeOnboarding
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 group"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );
}
