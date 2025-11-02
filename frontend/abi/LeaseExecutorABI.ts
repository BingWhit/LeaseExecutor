
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const LeaseExecutorABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "closer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "lessor",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "lessee",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseExpired",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseRefundCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "updater",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaseViolation",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        }
      ],
      "name": "checkLeaseStates",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        }
      ],
      "name": "closeLease",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "lessee",
          "type": "address"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedUsageCount",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedDaysLeft",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedPaymentStatus",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedAmountPaid",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "usageCountProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "daysLeftProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "paymentStatusProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "amountPaidProof",
          "type": "bytes"
        }
      ],
      "name": "createLease",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedLeaseTerms",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "encryptedUsageCount",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedDaysLeft",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedPaymentStatus",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedAmountPaid",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedStates",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "encryptedExpired",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedViolation",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedRefund",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLeaseCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        }
      ],
      "name": "getLeaseInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "lessor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "lessee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "updatedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "lessee",
          "type": "address"
        }
      ],
      "name": "getLesseeLeases",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "lessor",
          "type": "address"
        }
      ],
      "name": "getLessorLeases",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "leaseCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "leases",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "lessor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "lessee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "updatedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "euint32",
          "name": "encryptedUsageCount",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedDaysLeft",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedPaymentStatus",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedAmountPaid",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedUsedValue",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedExpired",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedViolation",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "encryptedRefund",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lesseeLeases",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lessorLeases",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedUsageCount",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedDaysLeft",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedPaymentStatus",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "usageCountProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "daysLeftProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "paymentStatusProof",
          "type": "bytes"
        }
      ],
      "name": "updateLease",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "leaseId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedUsedValue",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "usedValueProof",
          "type": "bytes"
        }
      ],
      "name": "updateUsedValue",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

