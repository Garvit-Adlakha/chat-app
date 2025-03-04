export const LayoutLoader = () => {
    return (
        <>
        <div className="grid grid-cols-4 gap-4 max-h-[calc(100vh-4rem)]">
            <div className="first hidden md:inline-block md:col-span-1 h-[calc(100vh-4rem)] ">
                <div className="skeleton mt-4 h-[calc(100vh-4rem)] w-full "></div>
            </div>
            <div className="col-span-3">
            <div className="skeleton h-[calc(100vh-4rem)] w-full"></div>
            </div>
            <div className="">

            </div>
        </div>
        </>
    )
}

export const AppLayoutLoader = () => {
    return (
        <>
            <div className="h-16 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] w-full">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="skeleton w-32 h-8"></div>
                    <div className="flex space-x-4">
                        <div className="skeleton w-10 h-10 rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4 max-h-[calc(100vh-4rem)]">
                {/* Sidebar skeleton */}
                <div className="first hidden md:inline-block md:col-span-1 h-[calc(100vh-4rem)]">
                    <div className="flex h-full">
                        {/* Navigation column */}
                        <div className="w-16 bg-neutral-200 dark:bg-neutral-900 h-full rounded-2xl mr-2 flex flex-col items-center py-6">
                            <div className="skeleton w-10 h-10 rounded-full mb-8"></div>
                            <div className="space-y-5 flex flex-col items-center">
                                <div className="skeleton w-6 h-6 rounded-md"></div>
                                <div className="skeleton w-6 h-6 rounded-md"></div>
                                <div className="skeleton w-6 h-6 rounded-md"></div>
                            </div>
                        </div>
                        
                        {/* Content column */}
                        <div className="flex-1 bg-white dark:bg-neutral-800 h-full p-4 rounded-2xl">
                            <div className="skeleton w-full h-10 mb-4"></div>
                            <div className="space-y-3 mt-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center p-2">
                                        <div className="skeleton w-10 h-10 rounded-full mr-3"></div>
                                        <div className="skeleton w-3/4 h-4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main content skeleton */}
                <div className="col-span-4 md:col-span-3 h-[calc(100vh-4rem)] p-4">
                    <div className="skeleton h-12 w-full mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="skeleton h-40 w-full"></div>
                        <div className="skeleton h-40 w-full"></div>
                    </div>
                    <div className="skeleton h-60 w-full mt-6"></div>
                </div>
            </div>
        </>
    )
}