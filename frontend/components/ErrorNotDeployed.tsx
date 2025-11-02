export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-red-500 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Contract Not Deployed</h2>
                <p className="text-red-100 text-sm mt-1">Setup Required</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-yellow-800 mb-1">Network Information</p>
                  <p className="text-yellow-700">
                    LeaseExecutor contract is not deployed on <span className="font-mono font-bold">Chain ID: {chainId ?? "unknown"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-black text-yellow-400 rounded-full flex items-center justify-center mr-3 text-sm">!</span>
                Deployment Instructions
              </h3>
              <div className="space-y-4">
                <DeploymentStep 
                  number={1}
                  title="Navigate to Backend"
                  command="cd ./backend"
                  description="Open terminal and go to the backend directory"
                />
                <DeploymentStep 
                  number={2}
                  title="Deploy Contract"
                  command="npx hardhat deploy --network hardhat"
                  description="Deploy the LeaseExecutor contract to your network"
                />
                <DeploymentStep 
                  number={3}
                  title="Generate ABI"
                  command="cd ../frontend && npm run genabi"
                  description="Generate the contract ABI for frontend integration"
                />
                <DeploymentStep 
                  number={4}
                  title="Refresh Page"
                  command="F5 or Ctrl+R"
                  description="Reload this page after successful deployment"
                />
              </div>
            </div>

            <div className="bg-black rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">
                Need help? Check the project documentation for detailed setup instructions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeploymentStep({ number, title, command, description }: { number: number; title: string; command: string; description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 bg-black text-yellow-400 rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-black mb-1">{title}</h4>
        <code className="block bg-black text-yellow-400 px-4 py-2 rounded-lg font-mono text-sm mb-2">
          {command}
        </code>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
