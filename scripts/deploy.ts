import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.utils.parseEther("0.001");
  const provider = new ethers.providers.JsonRpcProvider("http://44.211.145.54:8545");
  console.log({provider})
  const signer = new ethers.Wallet("0x2f33b5acf2a6809c29e279b576893eb658a34c4cc4df11fca083aa759369196b");
  console.log({address: signer.address});
  const connectedSigner = signer.connect(provider);
  // console.log(signer.address);
  const Lock = await ethers.getContractFactory("Lock", connectedSigner);
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log(
    `Lock with ${ethers.utils.formatEther(lockedAmount)}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
