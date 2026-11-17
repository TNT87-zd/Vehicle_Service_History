const { expect } = require('chai');
const { ethers } = require('hardhat');

const ID = '59A-12345';

async function fixture() {
  const [owner, mechanic, replacement, stranger] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('VehicleServiceHistory');
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  return { contract, owner, mechanic, replacement, stranger };
}

describe('VehicleServiceHistory', function () {
  it('owner registers vehicle and details are readable', async function () {
    const { contract, owner } = await fixture();
    await expect(contract.connect(owner).registerVehicle(ID)).to.emit(contract, 'VehicleRegistered');
    const v = await contract.getVehicle(ID);
    expect(v.owner).to.equal(owner.address);
    expect(v.mechanic).to.equal(ethers.ZeroAddress);
    expect(v.serviceCount).to.equal(0n);
  });

  it('duplicate vehicle identifiers are rejected', async function () {
    const { contract, owner, stranger } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await expect(contract.connect(stranger).registerVehicle(ID)).to.be.revertedWithCustomError(contract, 'VehicleAlreadyRegistered');
  });

  it('cannot register an empty identifier', async function () {
    const { contract } = await fixture();
    await expect(contract.registerVehicle('')).to.be.revertedWithCustomError(contract, 'EmptyIdentifier');
  });

  it('only owner may authorize mechanic', async function () {
    const { contract, owner, mechanic, stranger } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await expect(contract.connect(stranger).authorizeMechanic(ID, mechanic.address)).to.be.revertedWithCustomError(contract, 'NotVehicleOwner');
    await expect(contract.connect(owner).authorizeMechanic(ID, mechanic.address)).to.emit(contract, 'MechanicAuthorized');
    expect((await contract.getVehicle(ID)).mechanic).to.equal(mechanic.address);
  });

  it('rejects zero mechanic address', async function () {
    const { contract, owner } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await expect(contract.connect(owner).authorizeMechanic(ID, ethers.ZeroAddress)).to.be.revertedWithCustomError(contract, 'InvalidMechanic');
  });

  it('only authorized mechanic adds a dated service', async function () {
    const { contract, owner, mechanic, stranger } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await contract.connect(owner).authorizeMechanic(ID, mechanic.address);
    await expect(contract.connect(stranger).addService(ID, 'Oil change')).to.be.revertedWithCustomError(contract, 'NotAuthorizedMechanic');
    await expect(contract.connect(mechanic).addService(ID, 'Oil change')).to.emit(contract, 'ServiceAdded');
    const record = await contract.getService(ID, 0);
    expect(record.mechanic).to.equal(mechanic.address);
    expect(record.servicedAt).to.be.greaterThan(0n);
    expect(record.description).to.equal('Oil change');
  });

  it('owner replaces mechanic; old mechanic loses access', async function () {
    const { contract, owner, mechanic, replacement } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await contract.connect(owner).authorizeMechanic(ID, mechanic.address);
    await contract.connect(mechanic).addService(ID, 'First service');
    await contract.connect(owner).authorizeMechanic(ID, replacement.address);
    await expect(contract.connect(mechanic).addService(ID, 'Should fail')).to.be.revertedWithCustomError(contract, 'NotAuthorizedMechanic');
    await contract.connect(replacement).addService(ID, 'Second service');
    expect((await contract.getVehicle(ID)).serviceCount).to.equal(2n);
    expect((await contract.getService(ID, 0)).mechanic).to.equal(mechanic.address);
    expect((await contract.getService(ID, 1)).mechanic).to.equal(replacement.address);
  });

  it('rejects empty service description', async function () {
    const { contract, owner, mechanic } = await fixture();
    await contract.connect(owner).registerVehicle(ID);
    await contract.connect(owner).authorizeMechanic(ID, mechanic.address);
    await expect(contract.connect(mechanic).addService(ID, '')).to.be.revertedWithCustomError(contract, 'EmptyDescription');
  });

  it('rejects unregistered vehicle and invalid service index', async function () {
    const { contract, owner } = await fixture();
    await expect(contract.getVehicle('NOT-REGISTERED')).to.be.revertedWithCustomError(contract, 'VehicleNotFound');
    await contract.connect(owner).registerVehicle(ID);
    await expect(contract.getService(ID, 0)).to.be.revertedWithCustomError(contract, 'ServiceIndexOutOfBounds');
  });
});
