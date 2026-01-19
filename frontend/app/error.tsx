'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#1a1a2e] to-[#0a0a0c] flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl m-auto mb-8 flex items-center justify-center text-4xl">
                    ⚠️
                </div>
                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                    Something Went Wrong
                </h1>
                <p className="text-gray-400 mb-2 font-medium text-sm">
                    {error.message || 'An unexpected error occurred'}
                </p>
                {error.digest && (
                    <p className="text-gray-600 mb-8 text-xs font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-pink-500/20 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="block w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-wider"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
