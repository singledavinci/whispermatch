// Contract addresses (deployed to Sepolia testnet)
// EXACT EIP-55 checksums from Etherscan - DO NOT modify casing!
export const CONTRACTS = {
    LoveToken: '0xB4e591f05057A7873AC7993BE12eB18a42B8c999' as `0x${string}`,
    BurnMint: '0x8b016E6a69c789b1e1824E63d0165AEB9b7B809d' as `0x${string}`,
    ProfileRegistry: '0x28818cd3F3cE01fe7DF8583239F363B112f07429' as `0x${string}`,
    MatchRegistry: '0xAB9DEBd7bBb9C8aBC271469194e4b58c41f1c66E' as `0x${string}`,
    MessageRegistry: '0x600943981BE410ddeAC300944006A34F5ba4A0E8' as `0x${string}`,
} as const;

// LoveToken ABI (minimal for demo)
export const LOVE_TOKEN_ABI = [
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

// BurnMint ABI
export const BURN_MINT_ABI = [
    {
        type: 'function',
        name: 'burnAndCommit',
        stateMutability: 'payable',
        inputs: [{ name: 'commitmentHash', type: 'bytes32' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'mintWithProof',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'secret', type: 'bytes32' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
] as const;

// ProfileRegistry ABI
export const PROFILE_REGISTRY_ABI = [
    {
        type: 'function',
        name: 'createProfile',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'ipfsHash', type: 'string' },
            { name: 'minLuvToView', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'updateProfile',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'newIpfsHash', type: 'string' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'getProfile',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            { name: 'ipfsHash', type: 'string' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'isActive', type: 'bool' },
            { name: 'minLuvToView', type: 'uint256' },
        ],
    },
    {
        type: 'function',
        name: 'getActiveProfiles',
        stateMutability: 'view',
        inputs: [{ name: 'viewer', type: 'address' }],
        outputs: [{ name: 'activeProfiles', type: 'address[]' }],
    },
    {
        type: 'function',
        name: 'profileExists',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: 'exists', type: 'bool' }],
    },
] as const;

// MatchRegistry ABI
export const MATCH_REGISTRY_ABI = [
    {
        type: 'function',
        name: 'sendLike',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'recipient', type: 'address' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'getMatchCount',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: 'count', type: 'uint256' }],
    },
] as const;

// MessageRegistry ABI
export const MESSAGE_REGISTRY_ABI = [
    {
        type: 'function',
        name: 'sendMessage',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'encryptedIpfsHash', type: 'string' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'getMessageIds',
        stateMutability: 'view',
        inputs: [{ name: 'recipient', type: 'address' }],
        outputs: [{ name: '', type: 'uint256[]' }],
    },
    {
        type: 'function',
        name: 'getMessage',
        stateMutability: 'view',
        inputs: [{ name: 'messageId', type: 'uint256' }],
        outputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'encryptedIpfsHash', type: 'string' },
            { name: 'timestamp', type: 'uint256' },
        ],
    },
] as const;
