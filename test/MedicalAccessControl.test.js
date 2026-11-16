const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalAccessControl Contract", function () {
  let contract;
  let owner, emergencyAdmin, patient, doctor;

  beforeEach(async function () {
    [owner, emergencyAdmin, patient, doctor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MedicalAccessControl");
    contract = await Factory.deploy(emergencyAdmin.address);
    await contract.waitForDeployment();
  });

  it("1. Should set the correct emergency admin role", async function () {
    const role = await contract.EMERGENCY_ADMIN_ROLE();
    expect(await contract.hasRole(role, emergencyAdmin.address)).to.equal(true);
  });

  it("2. Should allow patients to register document hashes", async function () {
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("MedicalRecord_DICOM_001"));
    await expect(contract.connect(patient).registerRecord(docHash))
      .to.emit(contract, "RecordRegistered")
      .withArgs(patient.address, docHash);
  });

  it("3. Should allow patients to grant temporary access to a doctor", async function () {
    await expect(contract.connect(patient).grantAccess(doctor.address, 3600))
      .to.emit(contract, "AccessGranted");
    expect(await contract.verifyAccess(patient.address, doctor.address)).to.equal(true);
  });

  it("4. Should correctly revoke doctor access", async function () {
    await contract.connect(patient).grantAccess(doctor.address, 3600);
    await contract.connect(patient).revokeAccess(doctor.address);
    expect(await contract.verifyAccess(patient.address, doctor.address)).to.equal(false);
  });

  it("5. Should deny access after expiration time", async function () {
    await contract.connect(patient).grantAccess(doctor.address, 1);
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine");
    expect(await contract.verifyAccess(patient.address, doctor.address)).to.equal(false);
  });

  it("6. Should allow emergency admin to pause the contract", async function () {
    await expect(contract.connect(emergencyAdmin).emergencyPause())
      .to.emit(contract, "EmergencyPaused")
      .withArgs(emergencyAdmin.address);
    expect(await contract.isPaused()).to.equal(true);
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
    await expect(contract.connect(patient).registerRecord(docHash))
      .to.be.revertedWith("System is paused in emergency");
  });
});
