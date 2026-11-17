// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Vehicle Service History
/// @notice A vehicle owner assigns one mechanic at a time. Only that mechanic may add records.
contract VehicleServiceHistory {
    error EmptyIdentifier();
    error IdentifierTooLong();
    error VehicleAlreadyRegistered();
    error VehicleNotFound();
    error NotVehicleOwner();
    error NotAuthorizedMechanic();
    error InvalidMechanic();
    error EmptyDescription();
    error DescriptionTooLong();
    error ServiceIndexOutOfBounds();

    struct ServiceRecord {
        address mechanic;
        uint64 servicedAt;
        string description;
    }

    struct Vehicle {
        string identifier;
        address owner;
        address mechanic;
        bool exists;
        ServiceRecord[] services;
    }

    mapping(bytes32 => Vehicle) private vehicles;

    event VehicleRegistered(bytes32 indexed vehicleKey, string identifier, address indexed owner);
    event MechanicAuthorized(bytes32 indexed vehicleKey, address indexed owner, address indexed mechanic);
    event ServiceAdded(bytes32 indexed vehicleKey, address indexed mechanic, uint256 indexed serviceIndex, uint64 servicedAt, string description);

    function _key(string memory identifier) private pure returns (bytes32) {
        uint256 len = bytes(identifier).length;
        if (len == 0) revert EmptyIdentifier();
        if (len > 64) revert IdentifierTooLong();
        return keccak256(bytes(identifier));
    }

    function registerVehicle(string calldata identifier) external {
        bytes32 key = _key(identifier);
        Vehicle storage vehicle = vehicles[key];
        if (vehicle.exists) revert VehicleAlreadyRegistered();
        vehicle.identifier = identifier;
        vehicle.owner = msg.sender;
        vehicle.exists = true;
        emit VehicleRegistered(key, identifier, msg.sender);
    }

    function authorizeMechanic(string calldata identifier, address newMechanic) external {
        bytes32 key = _key(identifier);
        Vehicle storage vehicle = vehicles[key];
        if (!vehicle.exists) revert VehicleNotFound();
        if (msg.sender != vehicle.owner) revert NotVehicleOwner();
        if (newMechanic == address(0)) revert InvalidMechanic();
        vehicle.mechanic = newMechanic;
        emit MechanicAuthorized(key, msg.sender, newMechanic);
    }

    function addService(string calldata identifier, string calldata description) external {
        bytes32 key = _key(identifier);
        Vehicle storage vehicle = vehicles[key];
        if (!vehicle.exists) revert VehicleNotFound();
        if (msg.sender != vehicle.mechanic || vehicle.mechanic == address(0)) revert NotAuthorizedMechanic();
        uint256 len = bytes(description).length;
        if (len == 0) revert EmptyDescription();
        if (len > 500) revert DescriptionTooLong();
        uint64 timestamp = uint64(block.timestamp);
        uint256 idx = vehicle.services.length;
        vehicle.services.push(ServiceRecord(msg.sender, timestamp, description));
        emit ServiceAdded(key, msg.sender, idx, timestamp, description);
    }

    function getVehicle(string calldata identifier) external view returns (
        string memory name, address owner, address mechanic, uint256 serviceCount
    ) {
        Vehicle storage vehicle = vehicles[_key(identifier)];
        if (!vehicle.exists) revert VehicleNotFound();
        return (vehicle.identifier, vehicle.owner, vehicle.mechanic, vehicle.services.length);
    }

    function getService(string calldata identifier, uint256 index) external view returns (
        address mechanic, uint64 servicedAt, string memory description
    ) {
        Vehicle storage vehicle = vehicles[_key(identifier)];
        if (!vehicle.exists) revert VehicleNotFound();
        if (index >= vehicle.services.length) revert ServiceIndexOutOfBounds();
        ServiceRecord storage record = vehicle.services[index];
        return (record.mechanic, record.servicedAt, record.description);
    }
}
