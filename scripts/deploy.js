const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory('VehicleServiceHistory');
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact('VehicleServiceHistory');
  const network = await hre.ethers.provider.getNetwork();
  const config = { address, chainId: Number(network.chainId), abi: artifact.abi };
  const outputPath = path.resolve(__dirname, '../frontend/contract.js');
  fs.writeFileSync(outputPath, 'window.CONTRACT_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n');

  console.log('Deployer:', deployer.address);
  console.log('VehicleServiceHistory:', address);
  console.log('Chain ID:', network.chainId.toString());
  console.log('Saved ABI + address:', outputPath);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
