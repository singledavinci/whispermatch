export function ProfileCardSkeleton() {
    return (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col animate-pulse">
            {/* Image skeleton */}
            <div className="relative h-2/3 bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="absolute bottom-6 left-8 space-y-3">
                    <div className="h-10 w-48 bg-gray-600 rounded-lg"></div>
                    <div className="h-4 w-32 bg-gray-600 rounded"></div>
                </div>
            </div>

            {/* Info skeleton */}
            <div className="flex-1 p-8 bg-black/40 space-y-4">
                <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
                    <div className="h-8 w-24 bg-gray-700 rounded-full"></div>
                    <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-4 w-full bg-gray-700 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
            </div>
        </div>
    );
}

export function MatchListSkeleton() {
    return (
        <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl animate-pulse">
                    <div className="w-14 h-14 bg-gray-700 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-700 rounded"></div>
                        <div className="h-3 w-24 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
