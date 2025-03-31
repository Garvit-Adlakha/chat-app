export const AppLayoutLoader = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-900">
         
            {/* Main Content Area */}
            <div className="flex flex-1 p-4 gap-4 overflow-hidden">
                {/* Sidebar */}
                <div className="hidden md:flex gap-2 w-80">
                    {/* Navigation Bar */}
                    <div className="w-16 h-full bg-neutral-800/50 rounded-2xl p-3 flex flex-col items-center gap-6">
                        <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
                        <div className="space-y-4 flex-1">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 bg-neutral-800 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                        <div className="w-8 h-8 bg-neutral-800 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 bg-neutral-800/50 rounded-2xl p-4">
                        <div className="h-10 bg-neutral-800 rounded-lg animate-pulse mb-4"></div>
                        <div className="space-y-3">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded animate-pulse"></div>
                                        <div className="h-3 w-24 bg-neutral-800/60 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-neutral-800/50 rounded-2xl overflow-hidden flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-neutral-700/50 flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-32 bg-neutral-800 rounded animate-pulse"></div>
                            <div className="h-3 w-24 bg-neutral-800/60 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} 
                                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${i % 2 === 0 ? 'bg-blue-500/20' : 'bg-neutral-800'} 
                                    w-64 h-16 rounded-2xl animate-pulse`}>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-neutral-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
                            <div className="flex-1 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
                            <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Update other loaders with the same color scheme
export const HomePageLoader = () => {
  return (
    <div className="bg-neutral-900 h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto text-center space-y-12">
        {/* Title skeleton */}
        <div className="space-y-6">
          <div className="h-16 w-3/4 mx-auto bg-neutral-800 rounded-2xl animate-pulse"></div>
          <div className="h-8 w-1/2 mx-auto bg-neutral-800/50 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="w-48 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
          <div className="w-48 h-12 bg-neutral-800/50 rounded-full animate-pulse"></div>
        </div>

        <div className="w-3/4 mx-auto mt-12 grid grid-cols-2 gap-4">
          <div className="h-24 bg-neutral-800/30 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-neutral-800/30 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const LoginPageLoader = () => {
  return (
    <div className="bg-neutral-900 min-h-screen flex items-center justify-center">
      <div className="hero-content flex-col lg:flex-row-reverse gap-8 max-w-6xl w-full">
        <div className="lg:w-1/2 mx-5 space-y-6">
          <div className="h-10 w-3/4 bg-neutral-800 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-neutral-800/50 rounded-xl animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-neutral-800/30 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-neutral-800/20 backdrop-blur-sm p-8 rounded-2xl border border-neutral-700">
            <div className="space-y-8">
              <div className="h-8 w-1/2 mx-auto bg-neutral-800 rounded-lg animate-pulse"></div>
              
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/4 bg-neutral-800/50 rounded animate-pulse"></div>
                    <div className="h-12 w-full bg-neutral-800 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="h-12 w-full bg-blue-900/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
