import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
    appName: 'WhisperMatch',
    projectId: '0f3937bfe2b9c74bdf919eb3794abb9b',
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
    ssr: true,
});
