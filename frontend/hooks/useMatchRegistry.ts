'use client';

import { useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { CONTRACTS, MATCH_REGISTRY_ABI } from '@/lib/contracts';
import { useState, useCallback } from 'react';

/**
 * Custom hook for match-related contract interactions
 */
export function useMatchRegistry() {
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const sendLike = useCallback(
        async (recipient: `0x${string}`) => {
            try {
                writeContract({
                    address: CONTRACTS.MatchRegistry,
                    abi: MATCH_REGISTRY_ABI,
                    functionName: 'sendLike',
                    args: [recipient],
                    gas: BigInt(200000),
                });
            } catch (error) {
                console.error('Error sending like:', error);
                throw error;
            }
        },
        [writeContract]
    );

    return {
        sendLike,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
    };
}

/**
 * Hook to listen for match events
 */
export function useMatchEvents(
    userAddress?: `0x${string}`,
    onMatch?: (matchedUser: `0x${string}`) => void
) {
    const [latestMatch, setLatestMatch] = useState<`0x${string}` | null>(null);

    useWatchContractEvent({
        address: CONTRACTS.MatchRegistry,
        abi: MATCH_REGISTRY_ABI,
        eventName: 'MatchCreated',
        onLogs(logs) {
            if (!userAddress || !onMatch) return;

            for (const log of logs) {
                // Type assertion for event args
                const args = log.args as any;
                const user1 = args?.user1 as `0x${string}` | undefined;
                const user2 = args?.user2 as `0x${string}` | undefined;

                if (user1 === userAddress && user2) {
                    setLatestMatch(user2);
                    onMatch(user2);
                } else if (user2 === userAddress && user1) {
                    setLatestMatch(user1);
                    onMatch(user1);
                }
            }
        },
    });

    return { latestMatch };
}
