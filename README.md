# MedRecord Safe — Smart Contract Prototype

Educational project for **Introduction to Finance**.

> **Disclaimer:** This is an educational prototype, not a real product, medical service, investment offer, or production-ready system. Do not use it with real funds or real patient data.

## Overview
MedRecord Safe is a proposed decentralized health-record registry and access-management concept. This repository contains a Solidity contract and Hardhat tests for document-hash registration, time-limited doctor access, revocation, access verification, and emergency pause.

The contract stores hashes and access permissions on-chain. It does not store medical files. A production system would need encrypted off-chain storage, secure key management, privacy controls, legal review, and independent security audits.

## Requirements
- Node.js 18 or newer
- npm
- Internet access for the first dependency installation

## Install
```bash
npm install
```

## Compile
```bash
npx hardhat compile
```

## Test
```bash
npx hardhat test
```
Expected result: **6 passing**.

## Local blockchain and deployment
Open Terminal 1 and keep it running:
```bash
npx hardhat node
```

Open Terminal 2 in the project folder:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

The script prints the deployer, emergency admin, and deployed contract address. For a temporary in-process network, run `npx hardhat run scripts/deploy.js`.

## Project structure
- `contracts/MedicalAccessControl.sol` — smart contract
- `test/MedicalAccessControl.test.js` — six unit tests
- `scripts/deploy.js` — deployment script
- `hardhat.config.js` — compiler and network configuration

## Roles
- `DEFAULT_ADMIN_ROLE`: assigned to the deployer.
- `EMERGENCY_ADMIN_ROLE`: assigned to the constructor's `emergencyAdmin` address.
- `DOCTOR_ROLE`: declared as a role identifier, but not enforced by the current prototype functions.

## Main functions
- `registerRecord(bytes32 docHash)` — registers a document hash for the caller.
- `grantAccess(address doctor, uint256 durationInSeconds)` — grants time-limited access.
- `revokeAccess(address doctor)` — revokes the caller's grant.
- `verifyAccess(address patient, address doctor)` — checks whether the grant is valid now.
- `emergencyPause()` — lets the emergency admin pause selected operations.

## Prototype limitations
- `verifyAccess` checks permissions; it does not retrieve or decrypt a medical file.
- Registered hashes are kept in a private mapping; there is no record-existence getter.
- Emergency pause blocks registration and granting access, but not revocation or verification.
- There is no unpause function.
- This is not a production identity, storage, encryption, or complete audit system.

## License
MIT — educational use.
