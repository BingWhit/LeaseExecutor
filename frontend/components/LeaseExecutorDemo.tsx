"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useLeaseExecutor } from "@/hooks/useLeaseExecutor";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState } from "react";
import { LeaseExecutorAddresses } from "@/abi/LeaseExecutorAddresses";

type PageType = "dashboard" | "create" | "leases" | "details";

export const LeaseExecutorDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const leaseExecutor = useLeaseExecutor({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Connect to MetaMask Screen
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto flex items-center justify-center pulse-glow">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect with MetaMask to access the confidential lease platform</p>
          </div>
          <button
            onClick={connect}
            className="px-8 py-4 bg-black text-yellow-400 font-bold text-lg rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  // Show not-deployed info ONLY when chainId is known AND no address configured for that network
  const hasConfiguredAddress =
    chainId !== undefined &&
    Boolean((LeaseExecutorAddresses as Record<string, { address?: string }>)[String(chainId)]?.address);
  if (chainId !== undefined && !hasConfiguredAddress) {
    return errorNotDeployed(chainId);
  }

  // Suppress stale "not deployed" messages once chainId/address are valid
  const shouldSuppressDeploymentMessage = (() => {
    const msg = (leaseExecutor.message ?? "").toLowerCase();
    if (!msg) return false;
    if (chainId === undefined) return true;
    if (hasConfiguredAddress && (msg.includes("not deployed") || msg.includes("deployment not found"))) return true;
    return false;
  })();

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        leasesCount={leaseExecutor.leases.filter((l: any) => l.isActive).length}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {currentPage === "dashboard" && (
          <DashboardPage 
            chainId={chainId}
            accounts={accounts}
            ethersSigner={ethersSigner}
            contractAddress={leaseExecutor.contractAddress}
            fhevmStatus={fhevmStatus}
            leasesCount={leaseExecutor.leases.length}
            selectedLeaseId={leaseExecutor.selectedLeaseId}
          />
        )}
        
        {currentPage === "create" && (
          <CreateLeasePage leaseExecutor={leaseExecutor} />
        )}
        
        {currentPage === "leases" && (
          <LeasesPage leaseExecutor={leaseExecutor} setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === "details" && leaseExecutor.selectedLeaseId && (
          <LeaseDetailsPage leaseExecutor={leaseExecutor} setCurrentPage={setCurrentPage} />
        )}

        {/* Status Messages */}
        {(((leaseExecutor.message && !shouldSuppressDeploymentMessage)) || fhevmError) && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="bg-black px-6 py-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">System Status</h2>
            </div>
            <div className="p-6 space-y-3">
              {leaseExecutor.message && !shouldSuppressDeploymentMessage && (
                <StatusMessage 
                  type={leaseExecutor.message.includes("Success") || leaseExecutor.message.includes("Created") ? "success" : "info"}
                  message={leaseExecutor.message}
                />
              )}
              {fhevmError && (
                <StatusMessage 
                  type="error"
                  message={fhevmError.message}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar Component
function Sidebar({ currentPage, setCurrentPage, leasesCount }: { 
  currentPage: PageType; 
  setCurrentPage: (page: PageType) => void;
  leasesCount: number;
}) {
  const menuItems = [
    { id: "dashboard" as PageType, label: "Dashboard", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: "create" as PageType, label: "Create Lease", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { id: "leases" as PageType, label: "My Leases", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), badge: leasesCount },
    { id: "details" as PageType, label: "Lease Details", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )},
  ];

  return (
    <aside className="w-64 bg-white rounded-2xl shadow-lg border-2 border-gray-200 h-fit sticky top-6">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b-2 border-gray-200">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-black">Navigation</h2>
            <p className="text-xs text-gray-500">Lease Manager</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                currentPage === item.id
                  ? 'bg-black text-yellow-400 shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  currentPage === item.id ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

// Dashboard Page
function DashboardPage({ 
  chainId, 
  accounts, 
  ethersSigner, 
  contractAddress, 
  fhevmStatus,
  leasesCount,
  selectedLeaseId
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-black to-gray-900 px-6 py-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Lease Executor</h1>
          <p className="text-gray-300">Manage your confidential leases with FHEVM technology</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Leases"
          value={leasesCount.toString()}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="FHEVM Status"
          value={fhevmStatus === "ready" ? "Protected" : fhevmStatus}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Selected Lease"
          value={selectedLeaseId ? `#${selectedLeaseId.toString()}` : "None"}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* Connection Info */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-black px-6 py-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-400">Connection Information</h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          {printProperty("Chain ID", chainId)}
          {printProperty("Wallet Address", ethersSigner ? ethersSigner.address : "No signer")}
          {printProperty("Contract Address", contractAddress)}
        </div>
      </div>
    </div>
  );
}

// Create Lease Page
function CreateLeasePage({ leaseExecutor }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      <div className="bg-black px-6 py-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-yellow-400">Create New Lease</h2>
      </div>
      <div className="p-6 space-y-4">
        <InputField
          label="Lessee Address"
          placeholder="0x..."
          value={leaseExecutor.lesseeAddress}
          onChange={(e) => leaseExecutor.setLesseeAddress(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Usage Count"
            type="number"
            value={leaseExecutor.usageCount}
            onChange={(e) => leaseExecutor.setUsageCount(Number(e.target.value))}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            }
          />
          <InputField
            label="Days Left"
            type="number"
            value={leaseExecutor.daysLeft}
            onChange={(e) => leaseExecutor.setDaysLeft(Number(e.target.value))}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Status
            </label>
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                onClick={() => leaseExecutor.setPaymentStatus(0)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 relative overflow-hidden ${
                  leaseExecutor.paymentStatus === 0
                    ? 'bg-black text-yellow-400 border-black shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-md'
                }`}
              >
                {leaseExecutor.paymentStatus === 0 && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Unpaid</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => leaseExecutor.setPaymentStatus(1)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 relative overflow-hidden ${
                  leaseExecutor.paymentStatus === 1
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white border-green-600 shadow-lg transform scale-105 pulse-glow'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:shadow-md'
                }`}
              >
                {leaseExecutor.paymentStatus === 1 && (
                  <div className="absolute top-0 right-0">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Paid</span>
                </div>
              </button>
            </div>
            
            {/* Status Message */}
            {leaseExecutor.paymentStatus === 0 ? (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r text-sm animate-fade-in">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-red-700">Unpaid Status Selected</p>
                  <p className="text-red-600">This lease is marked as unpaid. Payment will be required later.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2 p-3 bg-green-50 border-l-4 border-green-500 rounded-r text-sm animate-fade-in">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-green-700">Paid Status Selected</p>
                  <p className="text-green-600">Please enter the payment amount in ETH on the right →</p>
                </div>
              </div>
            )}
          </div>
          <InputField
            label="Amount Paid (ETH)"
            type="number"
            step="0.000000001"
            min="0"
            max="4.294967295"
            value={leaseExecutor.amountPaid}
            onChange={(e) => leaseExecutor.setAmountPaid(Number(e.target.value))}
            placeholder="0.0"
            helperText="Maximum: 4.294967295 ETH"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <ActionButton
            onClick={leaseExecutor.createLease}
            disabled={!leaseExecutor.canCreateLease}
            loading={leaseExecutor.isCreatingLease}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            {leaseExecutor.isCreatingLease ? "Creating Lease..." : "Create Lease"}
          </ActionButton>
          <ActionButton
            onClick={leaseExecutor.refreshLeases}
            disabled={!leaseExecutor.canRefreshLeases}
            secondary
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh Leases
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// Leases Page
function LeasesPage({ leaseExecutor, setCurrentPage }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      <div className="bg-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-400">My Leases</h2>
        </div>
        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold">
          {leaseExecutor.leases.filter((l: any) => l.isActive).length} Active
        </span>
      </div>
      <div className="p-6">
        {leaseExecutor.leases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Leases Found</h3>
            <p className="text-gray-500 mb-4">Create your first lease to get started</p>
            <button
              onClick={() => setCurrentPage("create")}
              className="px-6 py-3 bg-black text-yellow-400 font-bold rounded-lg hover:bg-gray-900 transition-all"
            >
              Create Lease
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {[...leaseExecutor.leases]
              .sort((a: any, b: any) => (a.id === b.id ? 0 : a.id > b.id ? -1 : 1))
              .map((lease: any, index: number) => (
              <div 
                key={lease.id.toString()} 
                className="border-2 border-gray-200 rounded-xl p-5 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-lg">#{lease.id.toString()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-lg">Lease #{lease.id.toString()}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <StatusBadge active={lease.isActive} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3 mb-4 bg-gray-50 p-4 rounded-lg">
                  <DetailRow label="Lessor" value={`${lease.lessor.slice(0, 10)}...${lease.lessor.slice(-8)}`} />
                  <DetailRow label="Lessee" value={`${lease.lessee.slice(0, 10)}...${lease.lessee.slice(-8)}`} />
                </div>
                
                <div className="flex space-x-3">
                  <ActionButton
                    onClick={() => {
                      leaseExecutor.selectLease(lease.id);
                      setCurrentPage("details");
                    }}
                    disabled={!leaseExecutor.canSelectLease}
                    small
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  >
                    View Details
                  </ActionButton>
                  <ActionButton
                    onClick={() => leaseExecutor.closeLease(lease.id)}
                    disabled={!leaseExecutor.canCloseLease}
                    small
                    secondary
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                  >
                    Close Lease
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Lease Details Page
function LeaseDetailsPage({ leaseExecutor, setCurrentPage }: any) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    usageCount: 0,
    daysLeft: 0,
    paymentStatus: 0,
    amountPaid: 0
  });

  const handleUpdateClick = () => {
    // Initialize with current values if available
    if (leaseExecutor.clearTerms) {
      setUpdateData({
        usageCount: Number(leaseExecutor.clearTerms.usageCount || 0),
        daysLeft: Number(leaseExecutor.clearTerms.daysLeft || 0),
        paymentStatus: Number(leaseExecutor.clearTerms.paymentStatus || 0),
        amountPaid: leaseExecutor.clearTerms.amountPaid 
          ? Number(leaseExecutor.clearTerms.amountPaid) / 1e9 
          : 0
      });
    }
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = () => {
    // Set the values in leaseExecutor
    leaseExecutor.setUsageCount(updateData.usageCount);
    leaseExecutor.setDaysLeft(updateData.daysLeft);
    leaseExecutor.setPaymentStatus(updateData.paymentStatus);
    leaseExecutor.setAmountPaid(updateData.amountPaid);
    
    // Close modal and update
    setShowUpdateModal(false);
    // 直接传入最新值，避免 React 状态尚未同步导致使用旧值
    leaseExecutor.updateSelectedLease({
      usageCount: updateData.usageCount,
      daysLeft: updateData.daysLeft,
      paymentStatus: updateData.paymentStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-400 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-black to-gray-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center pulse-glow">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">
              Lease #{leaseExecutor.selectedLeaseId.toString()}
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage("leases")}
            className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-all"
          >
            ← Back to Leases
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex space-x-4">
            <ActionButton
              onClick={leaseExecutor.decryptTerms}
              disabled={!leaseExecutor.canDecryptTerms}
              loading={leaseExecutor.isDecryptingTerms}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              }
            >
              {leaseExecutor.isDecryptingTerms ? "Decrypting..." : "Decrypt Terms"}
            </ActionButton>
          </div>

          {leaseExecutor.clearTerms && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-black">Decrypted Terms</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <DataCard label="Usage Count" value={leaseExecutor.clearTerms.usageCount?.toString() ?? "N/A"} />
                <DataCard label="Days Left" value={leaseExecutor.clearTerms.daysLeft?.toString() ?? "N/A"} />
                <DataCard label="Payment Status" value={leaseExecutor.clearTerms.paymentStatus === BigInt(0) ? "Unpaid" : leaseExecutor.clearTerms.paymentStatus === BigInt(1) ? "Paid" : "N/A"} />
                <DataCard 
                  label="Amount Paid" 
                  value={leaseExecutor.clearTerms.amountPaid 
                    ? `${(Number(leaseExecutor.clearTerms.amountPaid) / 1e9).toFixed(9)} ETH`
                    : "N/A"
                  } 
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <ActionButton
              onClick={handleUpdateClick}
              disabled={!leaseExecutor.canUpdateLease}
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Update Lease
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <UpdateLeaseModal
          updateData={updateData}
          setUpdateData={setUpdateData}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={handleUpdateSubmit}
          isUpdating={leaseExecutor.isUpdatingLease}
        />
      )}
    </div>
  );
}

// Update Lease Modal Component
function UpdateLeaseModal({ updateData, setUpdateData, onClose, onSubmit, isUpdating }: {
  updateData: any;
  setUpdateData: (data: any) => void;
  onClose: () => void;
  onSubmit: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">Update Lease Terms</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isUpdating}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">Enter new values for the lease terms below:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Usage Count"
              type="number"
              value={updateData.usageCount}
              onChange={(e) => setUpdateData({ ...updateData, usageCount: Number(e.target.value) })}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
            />
            <InputField
              label="Days Left"
              type="number"
              value={updateData.daysLeft}
              onChange={(e) => setUpdateData({ ...updateData, daysLeft: Number(e.target.value) })}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Status
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUpdateData({ ...updateData, paymentStatus: 0 })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
                    updateData.paymentStatus === 0
                      ? 'bg-black text-yellow-400 border-black shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Unpaid</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateData({ ...updateData, paymentStatus: 1 })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
                    updateData.paymentStatus === 1
                      ? 'bg-black text-yellow-400 border-black shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Paid</span>
                  </div>
                </button>
              </div>
            </div>
            <InputField
              label="Amount Paid (ETH)"
              type="number"
              step="0.000000001"
              min="0"
              max="4.294967295"
              value={updateData.amountPaid}
              onChange={(e) => setUpdateData({ ...updateData, amountPaid: Number(e.target.value) })}
              placeholder="0.0"
              helperText="Maximum: 4.294967295 ETH"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-6 py-3 bg-white text-black border-2 border-gray-300 font-bold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isUpdating}
              className="flex-1 px-6 py-3 bg-black text-yellow-400 font-bold rounded-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin inline-block -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Confirm Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    yellow: "bg-yellow-50 border-yellow-400 text-yellow-600",
    green: "bg-green-50 border-green-400 text-green-600",
    blue: "bg-blue-50 border-blue-400 text-blue-600"
  };

  return (
    <div className={`rounded-xl p-6 border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold text-black">{value}</p>
    </div>
  );
}

function InputField({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  helperText = "",
  icon,
  min,
  max,
  step
}: { 
  label: string; 
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  type?: string; 
  placeholder?: string; 
  helperText?: string;
  icon?: React.ReactNode;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all text-black`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
      </div>
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}

function ActionButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  secondary = false, 
  small = false,
  fullWidth = false,
  icon 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean; 
  loading?: boolean; 
  secondary?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  const baseClasses = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const sizeClasses = small ? "px-4 py-2 text-sm" : "px-6 py-3 text-base";
  const widthClasses = fullWidth ? "w-full" : "";
  const colorClasses = secondary 
    ? "bg-white text-black border-2 border-black hover:bg-gray-100" 
    : "bg-black text-yellow-400 hover:bg-gray-900 shadow-lg hover:shadow-xl";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${widthClasses} ${colorClasses}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-mono text-sm text-black font-semibold break-all">{value}</p>
    </div>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-lg text-black">{value}</p>
    </div>
  );
}

function StatusMessage({ type, message }: { type: "success" | "error" | "info"; message: string }) {
  const colors = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    info: "bg-blue-50 border-blue-500 text-blue-800"
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${colors[type]}`}>
      {icons[type]}
      <p className="font-medium flex-1">{message}</p>
    </div>
  );
}

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{name}</p>
      <p className="font-mono font-semibold text-black break-all">{displayValue}</p>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{name}</p>
      <span className={`font-mono font-semibold ${value ? 'text-green-500' : 'text-red-500'}`}>
        {value ? 'true' : 'false'}
      </span>
    </div>
  );
}
