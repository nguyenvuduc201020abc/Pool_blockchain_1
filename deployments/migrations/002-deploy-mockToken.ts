// eslint-disable-next-line node/no-unpublished-import
import { DeployFunction } from "hardhat-deploy/dist/types";
// eslint-disable-next-line node/no-unpublished-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-unpublished-import
import "hardhat-deploy";
// eslint-disable-next-line no-unused-vars
import { ethers, network } from "hardhat";

const func: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  await deploy("MockUSDT", {
    from: deployer,
    log: true,
    args: [],
  });
};

func.tags = ["mockToken"];
export default func;
