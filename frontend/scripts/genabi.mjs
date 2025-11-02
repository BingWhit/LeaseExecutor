import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "LeaseExecutor";

// <root>/backend
const rel = "../backend";

// <root>/frontend/abi
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (!optional) {
      console.error(
        `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    console.log(`Skipping ${chainName} deployment (not found, optional)`);
    return undefined;
  }

  const deploymentFile = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    if (!optional) {
      console.error(
        `${line}Unable to locate '${deploymentFile}' file.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    console.log(`Skipping ${chainName} deployment (contract file not found, optional)`);
    return undefined;
  }

  const jsonString = fs.readFileSync(deploymentFile, "utf-8");

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Function to read ABI from artifacts if deployment not found
function readABIFromArtifacts(contractName) {
  const artifactPath = path.join(dir, "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
  if (fs.existsSync(artifactPath)) {
    const artifactContent = fs.readFileSync(artifactPath, "utf-8");
    const artifact = JSON.parse(artifactContent);
    return artifact.abi;
  }
  return undefined;
}

// Localhost deployment (required for local dev)
// Try "hardhat" first (for hardhat network), then "localhost" (for anvil/localhost)
let deployLocalhost = readDeployment("hardhat", 31337, CONTRACT_NAME, true);
if (!deployLocalhost) {
  deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);
}

// Sepolia is optional - automatically skip if not deployed
const deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

// Get ABI from any available deployment, or from artifacts
let contractABI;
if (deployLocalhost) {
  contractABI = deployLocalhost.abi;
} else if (deploySepolia) {
  contractABI = deploySepolia.abi;
} else {
  // Fallback to artifacts if no deployment found
  contractABI = readABIFromArtifacts(CONTRACT_NAME);
  if (!contractABI) {
    console.error(
      `${line}Unable to find ABI. Please compile contracts first or deploy to a network.${line}`
    );
    process.exit(1);
  }
  console.log(`Using ABI from artifacts (no deployment found)`);
}

// Verify ABI matches if both deployments exist
if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Can't use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

// Build addresses object dynamically
const addressesEntries = [];

// Add Sepolia (chainId 11155111) if deployed
if (deploySepolia) {
  addressesEntries.push(
    `  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" }`
  );
}

// Add localhost (chainId 31337) - use deployment address or default
if (deployLocalhost) {
  addressesEntries.push(
    `  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" }`
  );
} else {
  // Use default address if no deployment found
  addressesEntries.push(
    `  "31337": { address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", chainId: 31337, chainName: "hardhat" }`
  );
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: contractABI }, null, 2)} as const;
\n`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
${addressesEntries.join(",\n")}
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);
