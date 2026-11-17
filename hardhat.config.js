require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    ganache: { url: 'http://127.0.0.1:7546', chainId: 1337 }
  }
};
