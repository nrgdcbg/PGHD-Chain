from web3 import Web3
from datetime import datetime
from .models import AuthUser

import json

web3 = Web3(Web3.HTTPProvider("HTTP://127.0.0.1:7545"))

with open("api/PGHD.json") as f:
    contract_data = json.load(f)
    contract_abi = contract_data['abi']

contract_address = '0xb7156b1db687eEc3BAB89D8407C27252a84E23f0'
contract = web3.eth.contract(address = contract_address, abi = contract_abi)

def set_patient_data(name, age, height, weight, systolic, diastolic, bloodsugar, symptoms, diet, timestamp, user_address):
    contract.functions.updateData(
        name,
        age,
        height,
        weight,
        systolic,
        diastolic,
        bloodsugar,
        symptoms,
        diet,
        timestamp
    ).transact({'from': user_address})

def read_patient_data(patient_address, requester_address):
    data = contract.functions.readData(patient_address).call({'from': requester_address})
    return {
        'name': data[0],
        'age': data[1],
        'height': data[2],
        'weight': data[3],
        'systolic': data[4],
        'diastolic': data[5],
        'bloodsugar': data[6],
        'symptoms': data[7],
        'diet': data[8],
        'timestamp': datetime.fromtimestamp(data[9])
    }

def get_patient_data_history(patient_address, requester_address):
    data_history = contract.functions.getDataHistory(patient_address).call({'from': requester_address})
    return [{
        'name': entry[0],
        'age': entry[1],
        'height': entry[2],
        'weight': entry[3],
        'systolic': entry[4],
        'diastolic': entry[5],
        'bloodsugar': entry[6],
        'symptoms': entry[7],
        'diet': entry[8],
        'timestamp': datetime.fromtimestamp(entry[9])
    } for entry in data_history]

def get_access_requests(patient_address):
    return contract.functions.getAccessRequests(patient_address).call()

def approve_access(patient_address, doctor_address, time_granted):
    contract.functions.grantAccess(doctor_address, time_granted).transact({'from': patient_address})

def revoke_access(patient_address, doctor_address, time_revoked):
    contract.functions.revokeAccess(doctor_address, time_revoked).transact({'from': patient_address})

def get_previous_requests(patient_address):
    return contract.functions.getPreviousRequests(patient_address).call()

def request_access(patient_address, doctor_address):
    contract.functions.requestAccess(patient_address).transact({'from': doctor_address})

def get_all_requests_by_doctor(doctor_address):
    patient_addresses = AuthUser.objects.filter(user_type=2).values_list('address', flat=True)
    list_requests = []
    access_requests = []

    for address in patient_addresses:
        list_requests += contract.functions.getAccessRequests(address).call()

    data = []

    for request in list_requests:
        if request[0] == doctor_address:
            if contract.functions.hasAccess(request[1], doctor_address).call():
                data.append(("Has Access!",))
            else:
                data.append(("No Access!",))

            request_data = (request,) + (data,)
            data = []
            access_requests.append(request_data)

    return access_requests
