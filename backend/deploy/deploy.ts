import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedLeaseExecutor = await deploy("LeaseExecutor", {
    from: deployer,
    log: true,
  });

  console.log(`LeaseExecutor contract deployed at: `, deployedLeaseExecutor.address);
};
export default func;
func.id = "deploy_leaseExecutor"; // id required to prevent reexecution
func.tags = ["LeaseExecutor"];
