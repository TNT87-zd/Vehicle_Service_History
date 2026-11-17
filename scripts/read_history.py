"""Optional read-only Web3.py example (no keys): python scripts/read_history.py 59A-12345 CONTRACT_ADDRESS"""
import json
import sys
from pathlib import Path
from web3 import Web3

if len(sys.argv) != 3:
    raise SystemExit('Usage: python scripts/read_history.py VEHICLE_ID CONTRACT_ADDRESS')

identifier = sys.argv[1].strip().upper()
address = Web3.to_checksum_address(sys.argv[2])
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545', request_kwargs={'timeout': 10}))
if not w3.is_connected():
    raise SystemExit('Ganache is not running at http://127.0.0.1:7545')

artifact = Path(__file__).resolve().parent.parent / 'artifacts' / 'contracts' / 'VehicleServiceHistory.sol' / 'VehicleServiceHistory.json'
abi = json.loads(artifact.read_text(encoding='utf8'))['abi']
contract = w3.eth.contract(address=address, abi=abi)
name, owner, mechanic, count = contract.functions.getVehicle(identifier).call()
print('Vehicle:', name, '\nOwner:', owner, '\nMechanic:', mechanic, '\nEntries:', count)
for i in range(count):
    who, timestamp, description = contract.functions.getService(identifier, i).call()
    from datetime import datetime, timezone
    print(f'[{i + 1}] {datetime.fromtimestamp(timestamp, timezone.utc).isoformat()} | {who} | {description}')
