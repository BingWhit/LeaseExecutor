// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential Lease Executor
/// @notice A privacy-preserving lease and subscription execution platform using FHEVM
/// @dev All lease terms (usage count, days left, payment status) are encrypted and processed in ciphertext
/// @author BingWhit
contract LeaseExecutor is ZamaEthereumConfig {
    /// @notice Lease contract structure
    struct Lease {
        uint256 id;
        address lessor;           // Service provider
        address lessee;            // User/tenant
        uint256 createdAt;         // Creation timestamp
        uint256 updatedAt;         // Last update timestamp
        bool isActive;             // Whether lease is active
        
        // Encrypted lease terms
        euint32 encryptedUsageCount;     // Encrypted usage count
        euint32 encryptedDaysLeft;      // Encrypted days remaining
        euint32 encryptedPaymentStatus; // Encrypted payment status (0=unpaid, 1=paid)
        euint32 encryptedAmountPaid;     // Encrypted amount paid
        euint32 encryptedUsedValue;     // Encrypted used value for refund calculation
        
        // Encrypted computed states
        euint32 encryptedExpired;       // Encrypted expired flag (0=active, 1=expired)
        euint32 encryptedViolation;     // Encrypted violation flag (0=compliant, 1=violation)
        euint32 encryptedRefund;        // Encrypted refund amount
    }

    // Mapping: leaseId => Lease
    mapping(uint256 => Lease) public leases;
    
    // Mapping: lessee => leaseId[]
    mapping(address => uint256[]) public lesseeLeases;
    
    // Mapping: lessor => leaseId[]
    mapping(address => uint256[]) public lessorLeases;
    
    // Lease counter
    uint256 public leaseCounter;

    // Events
    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed lessor,
        address indexed lessee,
        uint256 timestamp
    );
    
    event LeaseUpdated(
        uint256 indexed leaseId,
        address indexed updater,
        uint256 timestamp
    );
    
    event LeaseExpired(
        uint256 indexed leaseId,
        uint256 timestamp
    );
    
    event LeaseViolation(
        uint256 indexed leaseId,
        uint256 timestamp
    );
    
    event LeaseRefundCalculated(
        uint256 indexed leaseId,
        uint256 timestamp
    );
    
    event LeaseClosed(
        uint256 indexed leaseId,
        address indexed closer,
        uint256 timestamp
    );

    // Modifiers
    modifier validLease(uint256 leaseId) {
        require(leaseId > 0 && leaseId <= leaseCounter, "Invalid lease ID");
        _;
    }

    modifier onlyParticipant(uint256 leaseId) {
        Lease memory lease = leases[leaseId];
        require(
            msg.sender == lease.lessor || msg.sender == lease.lessee,
            "Not a participant"
        );
        _;
    }

    /// @notice Create a new encrypted lease contract
    /// @param lessee The address of the lessee (user/tenant)
    /// @param encryptedUsageCount Encrypted initial usage count
    /// @param encryptedDaysLeft Encrypted days left in lease
    /// @param encryptedPaymentStatus Encrypted payment status (0=unpaid, 1=paid)
    /// @param encryptedAmountPaid Encrypted amount paid
    /// @param usageCountProof Proof for encryptedUsageCount
    /// @param daysLeftProof Proof for encryptedDaysLeft
    /// @param paymentStatusProof Proof for encryptedPaymentStatus
    /// @param amountPaidProof Proof for encryptedAmountPaid
    /// @return leaseId The ID of the created lease
    function createLease(
        address lessee,
        externalEuint32 encryptedUsageCount,
        externalEuint32 encryptedDaysLeft,
        externalEuint32 encryptedPaymentStatus,
        externalEuint32 encryptedAmountPaid,
        bytes calldata usageCountProof,
        bytes calldata daysLeftProof,
        bytes calldata paymentStatusProof,
        bytes calldata amountPaidProof
    ) external returns (uint256) {
        require(lessee != address(0), "Invalid lessee address");
        require(lessee != msg.sender, "Lessor and lessee cannot be same");

        leaseCounter++;
        uint256 leaseId = leaseCounter;
        uint256 now_ = block.timestamp;

        // Convert external encrypted values to internal types
        euint32 usageCount = FHE.fromExternal(encryptedUsageCount, usageCountProof);
        euint32 daysLeft = FHE.fromExternal(encryptedDaysLeft, daysLeftProof);
        euint32 paymentStatus = FHE.fromExternal(encryptedPaymentStatus, paymentStatusProof);
        euint32 amountPaid = FHE.fromExternal(encryptedAmountPaid, amountPaidProof);

        // Initialize computed states
        euint32 expired = FHE.asEuint32(0);
        euint32 violation = FHE.asEuint32(0);
        euint32 usedValue = FHE.asEuint32(0);
        euint32 refund = FHE.asEuint32(0);

        leases[leaseId] = Lease({
            id: leaseId,
            lessor: msg.sender,
            lessee: lessee,
            createdAt: now_,
            updatedAt: now_,
            isActive: true,
            encryptedUsageCount: usageCount,
            encryptedDaysLeft: daysLeft,
            encryptedPaymentStatus: paymentStatus,
            encryptedAmountPaid: amountPaid,
            encryptedUsedValue: usedValue,
            encryptedExpired: expired,
            encryptedViolation: violation,
            encryptedRefund: refund
        });

        // Add to participant lists
        lesseeLeases[lessee].push(leaseId);
        lessorLeases[msg.sender].push(leaseId);

        // Allow decryption by contract and participants
        FHE.allowThis(usageCount);
        FHE.allow(usageCount, msg.sender);
        FHE.allow(usageCount, lessee);
        
        FHE.allowThis(daysLeft);
        FHE.allow(daysLeft, msg.sender);
        FHE.allow(daysLeft, lessee);
        
        FHE.allowThis(paymentStatus);
        FHE.allow(paymentStatus, msg.sender);
        FHE.allow(paymentStatus, lessee);
        
        FHE.allowThis(amountPaid);
        FHE.allow(amountPaid, msg.sender);
        FHE.allow(amountPaid, lessee);

        emit LeaseCreated(leaseId, msg.sender, lessee, now_);
        return leaseId;
    }

    /// @notice Update encrypted lease terms
    /// @param leaseId The ID of the lease
    /// @param encryptedUsageCount New encrypted usage count
    /// @param encryptedDaysLeft New encrypted days left
    /// @param encryptedPaymentStatus New encrypted payment status
    /// @param usageCountProof Proof for encryptedUsageCount
    /// @param daysLeftProof Proof for encryptedDaysLeft
    /// @param paymentStatusProof Proof for encryptedPaymentStatus
    function updateLease(
        uint256 leaseId,
        externalEuint32 encryptedUsageCount,
        externalEuint32 encryptedDaysLeft,
        externalEuint32 encryptedPaymentStatus,
        bytes calldata usageCountProof,
        bytes calldata daysLeftProof,
        bytes calldata paymentStatusProof
    ) external validLease(leaseId) onlyParticipant(leaseId) {
        Lease storage lease = leases[leaseId];
        require(lease.isActive, "Lease is not active");

        // Convert external encrypted values to internal types
        euint32 usageCount = FHE.fromExternal(encryptedUsageCount, usageCountProof);
        euint32 daysLeft = FHE.fromExternal(encryptedDaysLeft, daysLeftProof);
        euint32 paymentStatus = FHE.fromExternal(encryptedPaymentStatus, paymentStatusProof);

        // Update lease terms
        lease.encryptedUsageCount = usageCount;
        lease.encryptedDaysLeft = daysLeft;
        lease.encryptedPaymentStatus = paymentStatus;
        lease.updatedAt = block.timestamp;

        // Allow decryption
        FHE.allowThis(usageCount);
        FHE.allow(usageCount, msg.sender);
        FHE.allow(usageCount, lease.lessor);
        FHE.allow(usageCount, lease.lessee);
        
        FHE.allowThis(daysLeft);
        FHE.allow(daysLeft, msg.sender);
        FHE.allow(daysLeft, lease.lessor);
        FHE.allow(daysLeft, lease.lessee);
        
        FHE.allowThis(paymentStatus);
        FHE.allow(paymentStatus, msg.sender);
        FHE.allow(paymentStatus, lease.lessor);
        FHE.allow(paymentStatus, lease.lessee);

        // Execute encrypted state checks
        _checkEncryptedStates(leaseId);

        emit LeaseUpdated(leaseId, msg.sender, block.timestamp);
    }

    /// @notice Check encrypted states (expired, violation) and calculate refund
    /// @param leaseId The ID of the lease
    function checkLeaseStates(uint256 leaseId)
        external
        validLease(leaseId)
        onlyParticipant(leaseId)
    {
        _checkEncryptedStates(leaseId);
    }

    /// @notice Internal function to check encrypted states
    /// @param leaseId The ID of the lease
    function _checkEncryptedStates(uint256 leaseId) internal {
        Lease storage lease = leases[leaseId];
        
        if (!lease.isActive) {
            return;
        }

        // Check if expired: daysLeft <= 0
        ebool isExpired = FHE.le(lease.encryptedDaysLeft, FHE.asEuint32(0));
        lease.encryptedExpired = FHE.select(isExpired, FHE.asEuint32(1), FHE.asEuint32(0));
        
        // Check if violation: paymentStatus == 0 (unpaid)
        ebool isUnpaid = FHE.eq(lease.encryptedPaymentStatus, FHE.asEuint32(0));
        lease.encryptedViolation = FHE.select(isUnpaid, FHE.asEuint32(1), FHE.asEuint32(0));

        // Calculate refund: amountPaid - usedValue
        // For simplicity, we'll use usageCount as a proxy for usedValue
        // In production, this should be a more sophisticated calculation
        lease.encryptedUsedValue = lease.encryptedUsageCount;
        lease.encryptedRefund = FHE.sub(lease.encryptedAmountPaid, lease.encryptedUsedValue);

        // Allow decryption of computed states
        FHE.allowThis(lease.encryptedExpired);
        FHE.allow(lease.encryptedExpired, lease.lessor);
        FHE.allow(lease.encryptedExpired, lease.lessee);
        
        FHE.allowThis(lease.encryptedViolation);
        FHE.allow(lease.encryptedViolation, lease.lessor);
        FHE.allow(lease.encryptedViolation, lease.lessee);
        
        FHE.allowThis(lease.encryptedRefund);
        FHE.allow(lease.encryptedRefund, lease.lessor);
        FHE.allow(lease.encryptedRefund, lease.lessee);

        // Note: Decryption happens on the frontend
        // Events are emitted to allow frontend to detect state changes
        // Frontend should decrypt encryptedExpired and encryptedViolation to determine if events should be processed
        emit LeaseRefundCalculated(leaseId, block.timestamp);
    }

    /// @notice Update used value for refund calculation
    /// @param leaseId The ID of the lease
    /// @param encryptedUsedValue New encrypted used value
    /// @param usedValueProof Proof for encryptedUsedValue
    function updateUsedValue(
        uint256 leaseId,
        externalEuint32 encryptedUsedValue,
        bytes calldata usedValueProof
    ) external validLease(leaseId) onlyParticipant(leaseId) {
        Lease storage lease = leases[leaseId];
        require(lease.isActive, "Lease is not active");

        euint32 usedValue = FHE.fromExternal(encryptedUsedValue, usedValueProof);
        lease.encryptedUsedValue = usedValue;
        lease.updatedAt = block.timestamp;

        // Recalculate refund
        lease.encryptedRefund = FHE.sub(lease.encryptedAmountPaid, lease.encryptedUsedValue);

        // Allow decryption
        FHE.allowThis(lease.encryptedRefund);
        FHE.allow(lease.encryptedRefund, lease.lessor);
        FHE.allow(lease.encryptedRefund, lease.lessee);

        emit LeaseUpdated(leaseId, msg.sender, block.timestamp);
    }

    /// @notice Close a lease contract
    /// @param leaseId The ID of the lease
    function closeLease(uint256 leaseId)
        external
        validLease(leaseId)
        onlyParticipant(leaseId)
    {
        Lease storage lease = leases[leaseId];
        require(lease.isActive, "Lease is already closed");

        lease.isActive = false;
        lease.updatedAt = block.timestamp;

        emit LeaseClosed(leaseId, msg.sender, block.timestamp);
    }

    /// @notice Get lease basic information (non-encrypted)
    /// @param leaseId The ID of the lease
    /// @return id Lease ID
    /// @return lessor Lessor address
    /// @return lessee Lessee address
    /// @return createdAt Creation timestamp
    /// @return updatedAt Last update timestamp
    /// @return isActive Whether lease is active
    function getLeaseInfo(uint256 leaseId)
        external
        view
        validLease(leaseId)
        returns (
            uint256 id,
            address lessor,
            address lessee,
            uint256 createdAt,
            uint256 updatedAt,
            bool isActive
        )
    {
        Lease memory lease = leases[leaseId];
        return (
            lease.id,
            lease.lessor,
            lease.lessee,
            lease.createdAt,
            lease.updatedAt,
            lease.isActive
        );
    }

    /// @notice Get encrypted lease terms (returns handles for decryption)
    /// @param leaseId The ID of the lease
    /// @return encryptedUsageCount Handle for encrypted usage count
    /// @return encryptedDaysLeft Handle for encrypted days left
    /// @return encryptedPaymentStatus Handle for encrypted payment status
    /// @return encryptedAmountPaid Handle for encrypted amount paid
    function getEncryptedLeaseTerms(uint256 leaseId)
        external
        view
        validLease(leaseId)
        returns (
            euint32 encryptedUsageCount,
            euint32 encryptedDaysLeft,
            euint32 encryptedPaymentStatus,
            euint32 encryptedAmountPaid
        )
    {
        Lease memory lease = leases[leaseId];
        return (
            lease.encryptedUsageCount,
            lease.encryptedDaysLeft,
            lease.encryptedPaymentStatus,
            lease.encryptedAmountPaid
        );
    }

    /// @notice Get encrypted computed states (returns handles for decryption)
    /// @param leaseId The ID of the lease
    /// @return encryptedExpired Handle for encrypted expired flag
    /// @return encryptedViolation Handle for encrypted violation flag
    /// @return encryptedRefund Handle for encrypted refund amount
    function getEncryptedStates(uint256 leaseId)
        external
        view
        validLease(leaseId)
        returns (
            euint32 encryptedExpired,
            euint32 encryptedViolation,
            euint32 encryptedRefund
        )
    {
        Lease memory lease = leases[leaseId];
        return (
            lease.encryptedExpired,
            lease.encryptedViolation,
            lease.encryptedRefund
        );
    }

    /// @notice Get all lease IDs for a lessee
    /// @param lessee The lessee address
    /// @return Array of lease IDs
    function getLesseeLeases(address lessee)
        external
        view
        returns (uint256[] memory)
    {
        return lesseeLeases[lessee];
    }

    /// @notice Get all lease IDs for a lessor
    /// @param lessor The lessor address
    /// @return Array of lease IDs
    function getLessorLeases(address lessor)
        external
        view
        returns (uint256[] memory)
    {
        return lessorLeases[lessor];
    }

    /// @notice Get total number of leases
    /// @return Total number of leases
    function getLeaseCount() external view returns (uint256) {
        return leaseCounter;
    }
}
