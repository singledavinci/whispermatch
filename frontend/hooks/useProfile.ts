'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, PROFILE_REGISTRY_ABI } from '@/lib/contracts';

/**
 * Custom hook for fetching active profiles with caching
 * @param address - User's wallet address
 * @returns Query result with profiles data
 */
export function useProfiles(address?: `0x${string}`) {
    return useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getActiveProfiles',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            staleTime: 60000, // Cache for 1 minute
            refetchOnWindowFocus: false,
        },
    });
}

/**
 * Custom hook for checking if user has a profile
 * @param address - User's wallet address
 */
export function useHasProfile(address?: `0x${string}`) {
    return useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'profileExists' as any, // Fallback for ABI compatibility
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            staleTime: 120000, // Cache for 2 minutes
        },
    });
}

/**
 * Custom hook for fetching user's profile data
 * @param address - User's wallet address
 */
export function useProfileData(address?: `0x${string}`) {
    return useReadContract({
        address: CONTRACTS.ProfileRegistry,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            staleTime: 60000,
        },
    });
}

/**
 * Hook for accessing current user's profile info
 */
export function useCurrentUserProfile() {
    const { address } = useAccount();
    const hasProfile = useHasProfile(address);
    const profileData = useProfileData(address);

    return {
        address,
        hasProfile: hasProfile.data,
        profileData: profileData.data,
        isLoading: hasProfile.isLoading || profileData.isLoading,
        refetch: () => {
            hasProfile.refetch();
            profileData.refetch();
        },
    };
}
