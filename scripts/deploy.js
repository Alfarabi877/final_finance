const { ethers } = require("hardhat");

async function main() {
  const [deployer, emergencyAdmin] = await ethers.getSigners();
  console.log("Deploying MedRecord Safe...");
  console.log("Deployer:", deployer.address);
  console.log("Emergency admin:", emergencyAdmin.address);

  const Factory = await ethers.getContractFactory("MedicalAccessControl");
  const contract = await Factory.deploy(emergencyAdmin.address);
  await contract.waitForDeployment();

  console.log("MedicalAccessControl deployed to:", await contract.getAddress());
  console.log("Emergency admin role assigned to:", emergencyAdmin.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
