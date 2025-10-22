const CannotAccessPage = () => {
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xs p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
               
                <div className="w-16 h-16 md:w-20 md:h-20 mb-4 text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
      
              
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  This site can't be reached
                </h1>
                <p className="text-gray-600 mb-6">
                  The connection was interrupted while loading the page.
                </p>
      
                <div className="w-full bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-gray-700 font-medium mb-2">
                    Try the following:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Check your network connection</li>
                    <li>Refresh the page</li>
                    <li>Check the site address for typos</li>
                  </ul>
                </div>
      
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-primary text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };
      

export default CannotAccessPage