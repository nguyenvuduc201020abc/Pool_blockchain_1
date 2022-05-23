import { expect } from "chai";
import { ethers } from "hardhat";
import { Wallet, Signer, utils, BigNumber } from "ethers";
import * as USDT from "../artifacts/contracts/mocks/MockUSDT.sol/MockUSDT.json";
import * as StakingPoolABI from "../artifacts/contracts/StakingPool.sol/StakingPool.json";
import web3 from "web3";
const { fromWei, toWei } = web3.utils;

describe("StakingPool Contract", () => {
  let USDTContract,
    usdt: any,
    StakingPool,
    stakingPool: any,
    owner: any,
    addr1: any,
    rewardDistributor: any;
  beforeEach(async () => {
    const wallets: any = await ethers.getSigners();

    owner = wallets[0];
    addr1 = wallets[1];
    rewardDistributor = wallets[2];
    // deploy usdt token
    USDTContract = await ethers.getContractFactory("MockUSDT");
    usdt = await USDTContract.deploy();

    // deploy staking-pool
    StakingPool = await ethers.getContractFactory("StakingPool");
    stakingPool = await StakingPool.deploy();
    console.log("stakingPool.address: ", stakingPool.address);

    // mint token
    usdt.mint(addr1.address, BigNumber.from(toWei("10000")));
    usdt.mint(rewardDistributor.address, BigNumber.from(toWei("10000")));

    // approve token
    usdt
      .connect(addr1)
      .approve(stakingPool.address, BigNumber.from(toWei("10000")));
    usdt
      .connect(rewardDistributor)
      .approve(stakingPool.address, BigNumber.from(toWei("10000")));

    const balanceOfAddr1 = await usdt.balanceOf(addr1.address);
    console.log("balanceOfAddr1: ", balanceOfAddr1);

    await stakingPool.__StakingPool_init();
    await stakingPool.setRewardDistributor(rewardDistributor.address);
  });

  describe("test function create pool", () => {
    it("create pool successfully", async () => {
      await stakingPool
        .connect(owner)
        .createPool(
          usdt.address,
          BigNumber.from(toWei("1000")),
          BigNumber.from(toWei("30")),
          0,
          BigNumber.from(toWei("600"))
        );
      const contract = new ethers.Contract(
        stakingPool.address,
        StakingPoolABI.abi,
        ethers.provider
      );
      const listPool = await contract.poolInfo(0);
      expect(listPool.length).to.equal(6);
    });
  });

  describe("test deposit function", () => {
    it("deposit success", async () => {
      await stakingPool
        .connect(owner)
        .createPool(
          usdt.address,
          BigNumber.from(toWei("1000")),
          BigNumber.from(toWei("30")),
          0,
          BigNumber.from(toWei("600"))
        );

      const contract = new ethers.Contract(
        stakingPool.address,
        StakingPoolABI.abi,
        ethers.provider
      );

      const res = await stakingPool
        .connect(addr1)
        .deposit(0, BigNumber.from(toWei("100")));

      const eventFilter2 = contract.filters.StakingPoolDeposit();

      const events2 = await contract.queryFilter(
        eventFilter2,
        res.blockNumber,
        res.blockNumber
      );

      expect(events2[0].args?.amount).to.equal(BigNumber.from(toWei("100")));
    });
  });

  describe("test withdraw function", () => {
    it("withdraw success", async () => {
      await stakingPool
        .connect(owner)
        .createPool(
          usdt.address,
          BigNumber.from(toWei("1000")),
          BigNumber.from(toWei("30")),
          0,
          600
        );
      await stakingPool.connect(addr1).deposit(0, BigNumber.from(toWei("100")));
      await stakingPool.connect(addr1).deposit(0, BigNumber.from(toWei("200")));
      console.log("total: ", await stakingPool.totalStakedOfPool(0));
      await stakingPool
        .connect(addr1)
        .withdraw(0, BigNumber.from(toWei("100")), 0);
      console.log("total: ", await stakingPool.totalStakedOfPool(0));

      // test total staked amount of pool
      expect(await stakingPool.totalStakedOfPool(0)).to.equal(
        BigNumber.from(toWei("200"))
      );

      // test pending reward
      console.log(
        "pending: ",
        await stakingPool.connect(addr1).getPendingReward(0, 0)
      );
      // console.log(
      //   "mul: ",
      //   BigNumber.from(toWei("100")).mul(BigNumber.from(toWei("0.3")))
      // );
      expect(await stakingPool.connect(addr1).getPendingReward(0, 0)).to.equal(
        BigNumber.from(toWei("30"))
      );
    });
  });

  describe("test claim function", () => {
    it("claim success", async () => {
      await stakingPool
        .connect(owner)
        .createPool(
          usdt.address,
          BigNumber.from(toWei("1000")),
          BigNumber.from(toWei("30")),
          0,
          600
        );
      await stakingPool.connect(addr1).deposit(0, BigNumber.from(toWei("100")));
      await stakingPool.connect(addr1).deposit(0, BigNumber.from(toWei("200")));

      // withdraw token
      await stakingPool
        .connect(addr1)
        .withdraw(0, BigNumber.from(toWei("100")), 0);
      // pending = 100 * 0.3
      console.log("rewardDistributor: ", rewardDistributor.address);
      console.log("owner test: ", owner.address);
      console.log("addr1 test: ", addr1.address);
      // claim reward
      await stakingPool.connect(addr1).claimRewardPool(0, 0);

      expect(await stakingPool.connect(addr1).getPendingReward(0, 0)).to.equal(
        0
      );
    });
  });
});
