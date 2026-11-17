window.CONTRACT_CONFIG = {
    "address":  "0xC80fd3BA047299Db0D4ff32AFCCE43d8891f09e7",
    "chainId":  1337,
    "abi":  [
                {
                    "inputs":  [

                               ],
                    "name":  "DescriptionTooLong",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "EmptyDescription",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "EmptyIdentifier",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "IdentifierTooLong",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "InvalidMechanic",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "NotAuthorizedMechanic",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "NotVehicleOwner",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "ServiceIndexOutOfBounds",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "VehicleAlreadyRegistered",
                    "type":  "error"
                },
                {
                    "inputs":  [

                               ],
                    "name":  "VehicleNotFound",
                    "type":  "error"
                },
                {
                    "anonymous":  false,
                    "inputs":  [
                                   {
                                       "indexed":  true,
                                       "internalType":  "bytes32",
                                       "name":  "vehicleKey",
                                       "type":  "bytes32"
                                   },
                                   {
                                       "indexed":  true,
                                       "internalType":  "address",
                                       "name":  "owner",
                                       "type":  "address"
                                   },
                                   {
                                       "indexed":  true,
                                       "internalType":  "address",
                                       "name":  "mechanic",
                                       "type":  "address"
                                   }
                               ],
                    "name":  "MechanicAuthorized",
                    "type":  "event"
                },
                {
                    "anonymous":  false,
                    "inputs":  [
                                   {
                                       "indexed":  true,
                                       "internalType":  "bytes32",
                                       "name":  "vehicleKey",
                                       "type":  "bytes32"
                                   },
                                   {
                                       "indexed":  true,
                                       "internalType":  "address",
                                       "name":  "mechanic",
                                       "type":  "address"
                                   },
                                   {
                                       "indexed":  true,
                                       "internalType":  "uint256",
                                       "name":  "serviceIndex",
                                       "type":  "uint256"
                                   },
                                   {
                                       "indexed":  false,
                                       "internalType":  "uint64",
                                       "name":  "servicedAt",
                                       "type":  "uint64"
                                   },
                                   {
                                       "indexed":  false,
                                       "internalType":  "string",
                                       "name":  "description",
                                       "type":  "string"
                                   }
                               ],
                    "name":  "ServiceAdded",
                    "type":  "event"
                },
                {
                    "anonymous":  false,
                    "inputs":  [
                                   {
                                       "indexed":  true,
                                       "internalType":  "bytes32",
                                       "name":  "vehicleKey",
                                       "type":  "bytes32"
                                   },
                                   {
                                       "indexed":  false,
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   },
                                   {
                                       "indexed":  true,
                                       "internalType":  "address",
                                       "name":  "owner",
                                       "type":  "address"
                                   }
                               ],
                    "name":  "VehicleRegistered",
                    "type":  "event"
                },
                {
                    "inputs":  [
                                   {
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   },
                                   {
                                       "internalType":  "string",
                                       "name":  "description",
                                       "type":  "string"
                                   }
                               ],
                    "name":  "addService",
                    "outputs":  [

                                ],
                    "stateMutability":  "nonpayable",
                    "type":  "function"
                },
                {
                    "inputs":  [
                                   {
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   },
                                   {
                                       "internalType":  "address",
                                       "name":  "newMechanic",
                                       "type":  "address"
                                   }
                               ],
                    "name":  "authorizeMechanic",
                    "outputs":  [

                                ],
                    "stateMutability":  "nonpayable",
                    "type":  "function"
                },
                {
                    "inputs":  [
                                   {
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   },
                                   {
                                       "internalType":  "uint256",
                                       "name":  "index",
                                       "type":  "uint256"
                                   }
                               ],
                    "name":  "getService",
                    "outputs":  [
                                    {
                                        "internalType":  "address",
                                        "name":  "mechanic",
                                        "type":  "address"
                                    },
                                    {
                                        "internalType":  "uint64",
                                        "name":  "servicedAt",
                                        "type":  "uint64"
                                    },
                                    {
                                        "internalType":  "string",
                                        "name":  "description",
                                        "type":  "string"
                                    }
                                ],
                    "stateMutability":  "view",
                    "type":  "function"
                },
                {
                    "inputs":  [
                                   {
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   }
                               ],
                    "name":  "getVehicle",
                    "outputs":  [
                                    {
                                        "internalType":  "string",
                                        "name":  "name",
                                        "type":  "string"
                                    },
                                    {
                                        "internalType":  "address",
                                        "name":  "owner",
                                        "type":  "address"
                                    },
                                    {
                                        "internalType":  "address",
                                        "name":  "mechanic",
                                        "type":  "address"
                                    },
                                    {
                                        "internalType":  "uint256",
                                        "name":  "serviceCount",
                                        "type":  "uint256"
                                    }
                                ],
                    "stateMutability":  "view",
                    "type":  "function"
                },
                {
                    "inputs":  [
                                   {
                                       "internalType":  "string",
                                       "name":  "identifier",
                                       "type":  "string"
                                   }
                               ],
                    "name":  "registerVehicle",
                    "outputs":  [

                                ],
                    "stateMutability":  "nonpayable",
                    "type":  "function"
                }
            ]
};
