// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Educational prototype only. Not production-ready and must not be used
 * with real patient data or real funds.
 */
contract MedicalAccessControl is AccessControl {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant EMERGENCY_ADMIN_ROLE = keccak256("EMERGENCY_ADMIN_ROLE");

    struct AccessGrant {
        bool isAuthorized;
        uint256 expiryTimestamp;
    }

    mapping(address => mapping(address => AccessGrant)) private _permissions;
    mapping(address => mapping(bytes32 => bool)) private _patientRecords;

    event AccessGranted(address indexed patient, address indexed doctor, uint256 expiryTimestamp);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event RecordRegistered(address indexed patient, bytes32 indexed docHash);
    event EmergencyPaused(address indexed admin);

    bool public isPaused = false;

    modifier whenNotPaused() {
        require(!isPaused, "System is paused in emergency");
        _;
    }

    constructor(address emergencyAdmin) {
        require(emergencyAdmin != address(0), "Invalid admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ADMIN_ROLE, emergencyAdmin);
    }

    function registerRecord(bytes32 docHash) external whenNotPaused {
        require(docHash != bytes32(0), "Invalid document hash");
        _patientRecords[msg.sender][docHash] = true;
        emit RecordRegistered(msg.sender, docHash);
    }

    function grantAccess(address doctor, uint256 durationInSeconds) external whenNotPaused {
        require(doctor != address(0), "Invalid doctor address");
        require(durationInSeconds > 0, "Duration must be positive");
        uint256 expiry = block.timestamp + durationInSeconds;
        _permissions[msg.sender][doctor] = AccessGrant({
            isAuthorized: true,
            expiryTimestamp: expiry
        });
        emit AccessGranted(msg.sender, doctor, expiry);
    }

    function revokeAccess(address doctor) external {
        _permissions[msg.sender][doctor].isAuthorized = false;
        _permissions[msg.sender][doctor].expiryTimestamp = 0;
        emit AccessRevoked(msg.sender, doctor);
    }

    function verifyAccess(address patient, address doctor) external view returns (bool) {
        AccessGrant memory grant = _permissions[patient][doctor];
        if (!grant.isAuthorized) return false;
        if (block.timestamp > grant.expiryTimestamp) return false;
        return true;
    }

    function emergencyPause() external onlyRole(EMERGENCY_ADMIN_ROLE) {
        isPaused = true;
        emit EmergencyPaused(msg.sender);
    }
}
