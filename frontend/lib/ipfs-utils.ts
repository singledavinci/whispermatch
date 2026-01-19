/**
 * IPFS Utility for simulating profile metadata retrieval
 * In a real-world app, this would use a Gateway or local IPFS node
 */

export interface ProfileMetadata {
    name: string;
    description: string;
    image: string;
    images: string[]; // Multiple photos
    interests: string[];
    age: string;
    location: string;
    prompts: { question: string; answer: string }[];
}

// Deterministic random generator based on CID/Address string
const seedRandom = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return () => {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
    };
};

const NAMES = ["Aria", "Julian", "Skyler", "Nova", "Leo", "Maya", "Cassian", "Zoe", "Elara", "Dante"];
const LOCATIONS = ["Neo Tokyo", "Cyber Berlin", "Cloud City", "Mars Colony", "Digital Oasis", "Meta Paris"];
const INTERESTS = ["ZK Proofs", "Cybernetics", "Retro-Futurism", "Neon Photography", "Synthwave", "Crypto Art", "DeFi Farming", "Neural Networks"];
const IMAGES = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800"
];
const PROMPT_QUESTIONS = [
    "My ideal Sunday",
    "I'm looking for",
    "Best way to start a convo with me",
    "My biggest flex",
    "We'll get along if"
];
const PROMPT_ANSWERS = [
    ["Brunch, then exploring art galleries in the metaverse", "Morning crypto trading, evening synthwave concerts", "Coding new DeFi protocols with coffee"],
    ["Someone who gets both tech AND emotions", "A partner in decentralized crime 😉", "Real connection in a digital world"],
    ["Ask me about my favorite ZK proof", "Send me your best cyberpunk meme", "Tell me what you're building"],
    ["Getting my first smart contract deployed at 19", "My neural network can predict market trends", "I've traveled to 15 countries"],
    ["You think pineapple on pizza is valid", "You're down for spontaneous adventures", "You appreciate good design AND good code"]
];

export async function resolveProfileMetadata(cid: string, address: string): Promise<ProfileMetadata> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    // For real CIDs that look like JSON (simulated in our profile flow)
    // We try to parse, but usually we just generate beautiful deterministic data for the demo
    const rng = seedRandom(address);
    const pick = (arr: any[]) => arr[Math.floor(rng() * arr.length)];

    // Mix interests
    const myInterests = [...INTERESTS].sort(() => rng() - 0.5).slice(0, 3);

    // Generate 3-5 photos per profile
    const numPhotos = Math.floor(rng() * 3) + 3;
    const shuffledImages = [...IMAGES].sort(() => rng() - 0.5);
    const profileImages = shuffledImages.slice(0, numPhotos);

    // Generate 2 random prompts
    const promptIndices = [0, 1, 2, 3, 4].sort(() => rng() - 0.5).slice(0, 2);
    const prompts = promptIndices.map(idx => ({
        question: PROMPT_QUESTIONS[idx],
        answer: PROMPT_ANSWERS[idx][Math.floor(rng() * PROMPT_ANSWERS[idx].length)]
    }));

    return {
        name: pick(NAMES),
        description: "Whispering into the void... Match with me to find out more.",
        image: profileImages[0],
        images: profileImages,
        interests: myInterests,
        age: Math.floor(rng() * 10 + 20).toString(),
        location: pick(LOCATIONS),
        prompts
    };
}
