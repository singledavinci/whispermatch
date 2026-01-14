// Contract addresses (deployed to Anvil - localhost:8545)
export const CONTRACTS = {
    LoveToken: '0x5fbdb2315678afecb367f032d93f642f64180aa3' as `0x${string}`,
    BurnMint: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512' as `0x${string}`,
    ProfileRegistry: '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9' as `0x${string}`,
    MatchRegistry: '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9' as `0x${string}`,
    MessageRegistry: '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707' as `0x${string}`,
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
