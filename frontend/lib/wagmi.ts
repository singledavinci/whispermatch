import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
    appName: 'WhisperMatch',
    projectId: '0f3937bfe2b9c74bdf919eb3794abb9b',
    chains: [localhost],
    transports: {
        [localhost.id]: http('http://localhost:8545'),
    },
    ssr: true,
});
