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

  // const StableFinancePoolFactory = await ethers.getContractFactory(
  //   "StakingPool"
  // );
  // const stableFinancePool = await StableFinancePoolFactory.deploy();
  // await stableFinancePool.deployed();

  // console.log(`Deployed success at address ${stableFinancePool.address}`);
  // console.log(`Start init`);

  // await stableFinancePool.__StakingPool_init();
  // console.log("Done");
  await deploy("StakingPool", {
    from: deployer,
    log: true,
    args: [],
    proxy: {
      proxyContract: "OptimizedTransparentProxy",
      owner: deployer,
      execute: {
        methodName: "__StakingPool_init",
        args: [],
      },
    },
  });
};

func.tags = ["StakingPool"];
export default func;
