
const { ethers } = require("hardhat");

async function main() {
    // Get test accounts from the local Hardhat blockchain
    const [patient, emergencyAdmin, doctor] = await ethers.getSigners();

    // Address of the deployed smart contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Connect to the deployed contract as the patient
    const medicalContract = await ethers.getContractAt(
        "MedicalAccessControl",
        contractAddress,
        patient
    );

    console.log("=== MEDRECORD SAFE DEMO ===");
    console.log("Patient:", patient.address);
    console.log("Doctor:", doctor.address);
    console.log("Emergency admin:", emergencyAdmin.address);

    // 1. Patient registers a medical document hash
    const documentHash = ethers.keccak256(
        ethers.toUtf8Bytes("Patient MRI Scan 001")
    );

    const registerTx = await medicalContract.registerRecord(documentHash);
    await registerTx.wait();

    console.log("\n1. Medical record registered");
    console.log("Document hash:", documentHash);

    // 2. Patient grants the doctor access for one hour
    const oneHour = 60 * 60;

    const grantTx = await medicalContract.grantAccess(
        doctor.address,
        oneHour
    );
    await grantTx.wait();

    console.log("\n2. Access granted to doctor for one hour");

    // 3. Verify doctor's access
    let hasAccess = await medicalContract.verifyAccess(
        patient.address,
        doctor.address
    );

    console.log("\n3. Doctor access before revocation:", hasAccess);

    // 4. Patient revokes doctor's access
    const revokeTx = await medicalContract.revokeAccess(doctor.address);
    await revokeTx.wait();

    console.log("\n4. Patient revoked doctor's access");

    // 5. Verify access again
    hasAccess = await medicalContract.verifyAccess(
        patient.address,
        doctor.address
    );

    console.log("\n5. Doctor access after revocation:", hasAccess);

    console.log("\n=== DEMO COMPLETED ===");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
