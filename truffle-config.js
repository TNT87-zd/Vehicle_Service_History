/**
 * Vehicle Service History (DS441) — Ganache workspace project link.
 * Workspace: VEHICLE_SERVICE_HISTORY
 * RPC: http://127.0.0.1:7546
 * Chain ID: 1338 (set this in Ganache workspace settings)
 *
 * This file is for Ganache's "Add Project" action and optional Truffle CLI.
 * The application itself uses Hardhat to compile/test/deploy.
 * Never add mnemonic/private keys to this file.
 */
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7546,
      network_id: '*'
    },
    ganache: {
      host: '127.0.0.1',
      port: 7546,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: '0.8.24',
      settings: {
        optimizer: { enabled: true, runs: 200 }
      }
    }
  }
};
