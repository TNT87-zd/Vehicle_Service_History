# DS441 — Demonstration Guide and Screenshot Checklist

Use the **VEHICLE_SERVICE_HISTORY** Ganache workspace at **`http://127.0.0.1:7546`**, Chain ID **1337** (Network ID **5778**). Use Ganache test ETH only. **Never show or upload private keys, seed phrases, or mnemonic words.**

This checklist uses the existing demonstration vehicle **`75K1-56389`** and the **Remix-deployed contract** at `0xC80fd3BA047299Db0D4ff32AFCCE43d8891f09e7`. **Do not redeploy or reset Ganache while collecting the remaining evidence**, since doing so would create a different state and invalidate the earlier screenshots.

## Screenshot checklist

| Status | Evidence to capture | Suggested filename |
|---|---|---|
| **Captured** | Owner wallet and `Current Mechanic` pointing to Mechanic A, before any service | `01_owner_authorizes_mechanic_a.png` |
| **Captured** | Mechanic A wallet, 1 service record, description, timestamp, and mechanic address | `02_mechanic_a_service_record.png` |
| **To capture** | Run `npm test`; show the terminal's actual pass/fail totals | `03_hardhat_test.png` |
| **To capture — required** | Mechanic B (still unauthorized) tries `Add Service Record`; capture the revert/error and show record count remains **1** | `04_unauthorized_mechanic_rejected.png` |
| **To capture** | Vehicle Owner switches authorized mechanic from A to B; `Current Mechanic` shows B | `05_owner_replaces_mechanic.png` |
| **To capture** | Former Mechanic A tries to add a record **after replacement** and is rejected; total stays **1** | `06_former_mechanic_rejected.png` |
| **To capture** | Mechanic B adds a valid service entry; service record count becomes **2** | `07_mechanic_b_service_record.png` |
| **To capture** | Public lookup displays the complete 2-entry history and distinct wallet addresses for A and B | `08_full_service_history.png` |
| **Optional** | Ganache workspace settings/accounts, RPC and network identification, with all secrets hidden | `09_ganache_network.png` |
| **Optional** | Remix Deployed Contracts showing VehicleServiceHistory address and successful deployment | `10_remix_deployment.png` |

The existing `01` and `02` files are included in the submission kit. The numbered files after that are **suggested future names, not evidence that already exists**.

## Exact steps to finish the required role/permission demonstration

### 1. Unauthorized Mechanic B attempt — do this **before** replacing A

1. Leave Mechanic A authorized for vehicle `75K1-56389`. The current record count should be **1**.
2. In MetaMask, switch to **Vehicle Mechanic B** (Ganache account index 2).
3. Click **Switch / Connect Wallet** in AutoLedger and confirm that the selected address is B, not the owner or Mechanic A.
4. Under **Add Service Record**, enter vehicle ID `75K1-56389` and description `Unauthorized tire inspection attempt`.
5. Click **Add Service Record**. The expected outcome is a **permission failure**, such as a decoded `NotAuthorizedMechanic` custom error or a generic estimate-gas/revert error.
6. **Capture screenshot `04_unauthorized_mechanic_rejected.png`** showing wallet B and the error. Verify through **Look Up Vehicle** that the number of entries remains **1**.

> Do not force-send a transaction that MetaMask warns will fail. If the UI's error is generic, the Hardhat unauthorized-access test can provide additional evidence of Solidity-based enforcement.

### 2. Vehicle Owner replaces Mechanic A with Mechanic B

1. Switch MetaMask back to **Vehicle Owner** (Ganache account index 0), and reconnect in AutoLedger.
2. Under **Authorize Mechanic**, enter `75K1-56389` and **Mechanic B's public wallet address** from Ganache index 2.
3. Click **Update Authorized Mechanic** and confirm the test transaction in MetaMask.
4. Click **Look Up Vehicle**; confirm `Current Mechanic` now equals Mechanic B's address.
5. **Capture screenshot `05_owner_replaces_mechanic.png`**.

### 3. Former Mechanic A is rejected

1. Switch MetaMask to **Vehicle Mechanic A** and reconnect.
2. Try recording `Former mechanic unauthorized attempt` for `75K1-56389`.
3. Confirm that the action is rejected and record count is still **1**.
4. **Capture screenshot `06_former_mechanic_rejected.png`**.

### 4. Mechanic B records a valid service

1. Switch MetaMask to **Vehicle Mechanic B** and reconnect.
2. In **Add Service Record**, enter `75K1-56389` and `Tire replacement and battery inspection`.
3. Confirm the MetaMask transaction and wait for it to be mined.
4. Look up the vehicle again; verify **2** service entries with the two descriptions and corresponding mechanic addresses.
5. **Capture screenshot `07_mechanic_b_service_record.png`**, followed by **`08_full_service_history.png`**.

### 5. Capture automated test results

In a terminal at the project root:

```powershell
cd D:\ZiDan\Vehicle_Service_History_DS441
npm test
```

Capture the **actual** passing/failing test results as `03_hardhat_test.png`. Do not write “9 passing” unless the terminal really reports 9 passing tests.

## Optional deployment evidence

The demonstrated contract was deployed **through Remix**, with Solidity 0.8.24 and EVM target `paris`. If you want an additional deployment screenshot, open **Remix → Deploy & Run Transactions → Deployed Contracts** and capture the deployed address. You do **not** need to deploy again just for a screenshot. Do not run `npm run deploy:ganache` after the Remix demonstration unless intentionally starting with a new contract.

## Short explanation for the instructor

> AutoLedger stores the vehicle owner's wallet address and one currently authorized mechanic per vehicle identifier. The Solidity contract checks `msg.sender`, so the same `addService` call succeeds or fails depending on which wallet submits it. Replacing a mechanic revokes the previous mechanic's write permission without removing historical service records. Every entry has a timestamp determined by the blockchain. Ganache provides the local Ethereum network, MetaMask signs transactions, ethers.js connects the web interface to the contract, and Hardhat supports automated testing.
