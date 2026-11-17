/* AutoLedger | Uses on-chain contract state, no browser database. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const config = window.CONTRACT_CONFIG;
  let provider, signer, account = null, contract;
  let loadedId = '';

  function short(address) { return address ? address.slice(0, 7) + '…' + address.slice(-5) : '—'; }
  function notify(message, type = '') {
    el('flash').className = 'flash' + (type ? ' ' + type : '');
    el('flash').textContent = message;
  }
  function normalizeId(id) { return id.trim().toUpperCase(); }
  function configured() {
    if (typeof ethers === 'undefined') throw new Error('Unable to load ethers.js. Check your internet connection.');
    if (!config || !ethers.isAddress(config.address) || !Array.isArray(config.abi) || !config.abi.length) {
      throw new Error('Contract address or ABI is missing. Configure frontend/contract.js after deploying the contract.');
    }
  }
  async function setupReadOnly() {
    configured();
    provider = new ethers.JsonRpcProvider('http://127.0.0.1:7546');
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== config.chainId) throw new Error('Ganache Chain ID mismatch: ' + network.chainId);
    if ((await provider.getCode(config.address)) === '0x') throw new Error('Contract not found on Ganache. Check the running workspace and deployed address.');
    contract = new ethers.Contract(config.address, config.abi, provider);
    el('network').textContent = 'Ganache · ' + network.chainId;
    el('netDot').classList.add('ok');
    el('chainStat').textContent = network.chainId.toString();
    el('blockStat').textContent = (await provider.getBlockNumber()).toString();
  }
  async function connect() {
    configured();
    if (!window.ethereum) throw new Error('MetaMask is required in your browser.');
    const walletProvider = new ethers.BrowserProvider(window.ethereum);
    await walletProvider.send('eth_requestAccounts', []);
    const network = await walletProvider.getNetwork();
    if (Number(network.chainId) !== config.chainId) throw new Error('MetaMask is on Chain ID ' + network.chainId + '. Switch to Ganache Chain ID ' + config.chainId + '.');
    if ((await walletProvider.getCode(config.address)) === '0x') throw new Error('Contract not found through MetaMask. Check the network and deployment.');
    signer = await walletProvider.getSigner();
    account = await signer.getAddress();
    provider = walletProvider;
    contract = new ethers.Contract(config.address, config.abi, signer);
    el('account').textContent = short(account);
    el('connect').textContent = 'Switch / Connect Wallet';
    el('network').textContent = 'Ganache · ' + network.chainId;
    el('netDot').classList.add('ok');
    el('chainStat').textContent = network.chainId.toString();
    el('blockStat').textContent = (await provider.getBlockNumber()).toString();
    notify('MetaMask connected: ' + account);
    if (loadedId) await lookup(loadedId);
  }
  async function requireWrite() {
    if (!signer || !account) await connect();
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== config.chainId) throw new Error('Incorrect Ganache network.');
    return contract;
  }
  async function transaction(label, callback) {
    const buttons = [...document.querySelectorAll('button')];
    buttons.forEach(b => b.disabled = true);
    try {
      const c = await requireWrite();
      notify(label + ': please confirm in MetaMask…', 'loading');
      const tx = await callback(c);
      el('txInfo').textContent = 'Transaction hash: ' + tx.hash;
      notify('Transaction submitted. Waiting for Ganache confirmation…', 'loading');
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('Transaction failed on the blockchain.');
      notify(label + ' completed successfully (block ' + receipt.blockNumber + ').');
      el('blockStat').textContent = receipt.blockNumber.toString();
      if (loadedId) await lookup(loadedId);
      return true;
    } catch (error) { showError(error); return false; }
    finally { buttons.forEach(b => b.disabled = false); }
  }
  function showError(error) {
    const message = error?.reason || error?.shortMessage || error?.message || String(error);
    notify('Error: ' + (error?.code === 'ACTION_REJECTED' || error?.code === 4001 ? 'The transaction was rejected by the user.' : message), 'error');
    console.error(error);
  }
  function createInfo(label, value) {
    const card = document.createElement('div'); card.className = 'info';
    const small = document.createElement('small'); small.textContent = label;
    const body = document.createElement('div'); body.textContent = value;
    card.append(small, body); return card;
  }
  async function lookup(raw) {
    const id = normalizeId(raw);
    if (!id) throw new Error('Enter a vehicle ID.');
    if (!contract) await setupReadOnly();
    const v = await contract.getVehicle(id);
    loadedId = id;
    const owner = v.owner, mechanic = v.mechanic;
    const role = account && owner.toLowerCase() === account.toLowerCase() ? 'Vehicle Owner' :
      account && mechanic !== ethers.ZeroAddress && mechanic.toLowerCase() === account.toLowerCase() ? 'Authorized Mechanic' : 'Viewer';
    el('roleStat').textContent = role;
    const panel = el('vehicleInfo'); panel.className = 'info-grid'; panel.replaceChildren(
      createInfo('Vehicle ID', v.name), createInfo('Current Role', role),
      createInfo('Vehicle Owner', owner), createInfo('Current Mechanic', mechanic === ethers.ZeroAddress ? 'Not assigned' : mechanic),
      createInfo('Service Records', v.serviceCount.toString()), createInfo('Smart contract', config.address)
    );
    const history = el('history'); history.className = 'timeline'; history.replaceChildren();
    const count = Number(v.serviceCount);
    if (count === 0) { history.className = 'empty'; history.textContent = 'This vehicle has no service records yet.'; }
    for (let i = count - 1; i >= 0; i--) {
      const record = await contract.getService(id, i);
      const item = document.createElement('div'); item.className = 'service';
      const step = document.createElement('div'); step.className = 'step'; step.textContent = String(i + 1);
      const content = document.createElement('div');
      const title = document.createElement('b'); title.textContent = new Date(Number(record.servicedAt) * 1000).toLocaleString('en-US');
      const description = document.createElement('p'); description.textContent = record.description;
      const by = document.createElement('small'); by.textContent = 'Serviced by: ' + record.mechanic;
      content.append(title, description, by); item.append(step, content); history.append(item);
    }
    notify('Loaded on-chain data for vehicle ' + id + '.');
  }
  async function action(fn) { try { await fn(); } catch (e) { showError(e); } }
  el('connect').addEventListener('click', () => action(connect));
  el('registerBtn').addEventListener('click', () => action(async () => {
    const id = normalizeId(el('registerId').value); if (!id) throw new Error('Enter a vehicle ID.');
    if (await transaction('Vehicle Registration', c => c.registerVehicle(id))) { el('lookupId').value = id; await lookup(id); }
  }));
  el('mechanicBtn').addEventListener('click', () => action(async () => {
    const id = normalizeId(el('mechanicId').value); const mechanic = el('mechanicAddress').value.trim();
    if (!id || !ethers.isAddress(mechanic)) throw new Error('Enter a vehicle ID and a valid mechanic address.');
    if (await transaction('Mechanic Authorization', c => c.authorizeMechanic(id, mechanic))) { el('lookupId').value = id; await lookup(id); }
  }));
  el('serviceBtn').addEventListener('click', () => action(async () => {
    const id = normalizeId(el('serviceId').value); const description = el('description').value.trim();
    if (!id || !description) throw new Error('Enter a vehicle ID and service description.');
    if (await transaction('Add Service Record', c => c.addService(id, description))) { el('lookupId').value = id; await lookup(id); }
  }));
  el('lookupBtn').addEventListener('click', () => action(() => lookup(el('lookupId').value)));
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => { account = null; signer = null; el('account').textContent = 'Wallet changed'; el('roleStat').textContent = '—'; notify('MetaMask account changed. Click Connect to refresh.', 'loading'); });
    window.ethereum.on('chainChanged', () => window.location.reload());
  }
  setupReadOnly().then(() => notify('Connected to Ganache. You can look up records publicly or connect MetaMask to submit transactions.')).catch(showError);
})();
