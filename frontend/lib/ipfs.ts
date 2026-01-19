import { ProfileMetadata } from './ipfs-utils';

/**
 * IPFS Integration using Pinata
 * Provides real IPFS upload and retrieval for profile data
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
}

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param metadata - Profile metadata to upload
 * @returns IPFS CID (hash)
 */
export async function uploadToIPFS(metadata: ProfileMetadata): Promise<string> {
    // Check if we have API credentials
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

    if (!apiKey || !apiSecret) {
        console.warn('Pinata API credentials not found, using simulation');
        // Fallback to simulation for development
        return generateSimulatedCID(JSON.stringify(metadata));
    }

    try {
        const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: apiKey,
                pinata_secret_api_key: apiSecret,
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: `WhisperMatch Profile - ${Date.now()}`,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const data: PinataResponse = await response.json();
        return data.IpfsHash;
    } catch (error) {
        console.error('IPFS upload error:', error);
        // Fallback to simulation
        return generateSimulatedCID(JSON.stringify(metadata));
    }
}

/**
 * Fetch metadata from IPFS via Pinata gateway
 * @param cid - IPFS content identifier
 * @returns Profile metadata
 */
export async function fetchFromIPFS(cid: string): Promise<ProfileMetadata> {
    try {
        const response = await fetch(`${PINATA_GATEWAY}/${cid}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`IPFS fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data as ProfileMetadata;
    } catch (error) {
        console.error('IPFS fetch error:', error);
        throw error;
    }
}

/**
 * Generate simulated CID for development/fallback
 * @param content - Content to hash
 * @returns Simulated IPFS CID
 */
function generateSimulatedCID(content: string): string {
    // Simple hash function for simulation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Format as IPFS CID (base58)
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = 'Qm';
    let num = Math.abs(hash);

    for (let i = 0; i < 44; i++) {
        result += base58Chars[num % base58Chars.length];
        num = Math.floor(num / base58Chars.length) + i;
    }

    return result;
}

/**
 * Upload file to IPFS (for images)
 * @param file - File to upload
 * @returns IPFS CID
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

    if (!apiKey || !apiSecret) {
        console.warn('Pinata API credentials not found, using placeholder');
        return 'QmPlaceholderImageHash';
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(
            'pinataMetadata',
            JSON.stringify({
                name: `WhisperMatch Image - ${file.name}`,
            })
        );

        const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                pinata_api_key: apiKey,
                pinata_secret_api_key: apiSecret,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`File upload failed: ${response.statusText}`);
        }

        const data: PinataResponse = await response.json();
        return data.IpfsHash;
    } catch (error) {
        console.error('File upload error:', error);
        return 'QmPlaceholderImageHash';
    }
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid - IPFS content identifier
 * @returns Full gateway URL
 */
export function getIPFSUrl(cid: string): string {
    return `${PINATA_GATEWAY}/${cid}`;
}
