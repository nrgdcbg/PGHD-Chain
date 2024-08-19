// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PGHD {
    struct Data {
        string name;
        uint age;
        uint height;
        uint weight;
        uint systolic;
        uint diastolic;
        uint bloodsugar;
        string symptoms;
        string diet;
        uint timestamp;
    }

    struct AccessRequest {
        address doctor;
        address patient;
        bool granted;
        uint timeGranted;
        uint timeRevoked;
    }

    mapping(address => Data) private patientData;
    mapping(address => AccessRequest[]) private accessRequests;
    mapping(address => AccessRequest[]) private previousRequests;
    mapping(address => Data[]) private dataHistory;

    event DataUpdated(address patient, string name, uint age, uint height, uint weight, uint systolic, uint diastolic, uint bloodsugar, string symptoms, string diet, uint timestamp);
    event AccessRequested(address patient, address doctor);
    event AccessGranted(address patient, address doctor);
    event AccessRevoked(address patient, address doctor);

    function updateData(string memory _name, uint _age, uint _height, uint _weight, uint  _systolic, uint _diastolic, uint _bloodsugar, string memory _symptoms, string memory _diet, uint _timestamp) public {
        address patient = msg.sender;
        Data memory currentData = patientData[patient];

        dataHistory[patient].push(currentData);
                patientData[msg.sender] = Data(_name, _age, _height, _weight, _systolic, _diastolic, _bloodsugar, _symptoms, _diet, _timestamp);
        emit DataUpdated(msg.sender, _name, _age, _height, _weight, _systolic, _diastolic, _bloodsugar, _symptoms, _diet, _timestamp);
    }

    function readData(address _patient) public view returns (string memory _name, uint _age, uint _height, uint _weight, uint  _systolic, uint _diastolic, uint _bloodsugar, string memory _symptoms, string memory _diet, uint _timestamp) {
        require(msg.sender == _patient || hasAccess(_patient, msg.sender), "Access denied");
        Data memory data = patientData[_patient];
        return (data.name, data.age, data.height, data.weight, data.systolic, data.diastolic, data.bloodsugar, data.symptoms, data.diet, data.timestamp);
    }

    function requestAccess(address _patient) public {
        AccessRequest[] storage requests = accessRequests[_patient];
        for (uint i = 0; i < requests.length; i++) {
            require(requests[i].doctor != msg.sender, "Access request already submitted");
        }
        requests.push(AccessRequest(msg.sender, _patient, false, 0, 0));
        emit AccessRequested(_patient, msg.sender);
    }

    function grantAccess(address _doctor, uint timeGranted) public {
        require(msg.sender != _doctor, "Patients cannot grant access to themselves");
        AccessRequest[] storage requests = accessRequests[msg.sender];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].doctor == _doctor) {
                requests[i].granted = true;
                requests[i].timeGranted = timeGranted;
                emit AccessGranted(msg.sender, _doctor);
                break;
            }
        }
    }

    function revokeAccess(address _doctor, uint timeRevoked) public {
        require(msg.sender != _doctor, "Patients cannot revoke access from themselves");
        AccessRequest[] storage requests = accessRequests[msg.sender];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].doctor == _doctor) {

                requests[i].granted = false;
                requests[i].timeRevoked = timeRevoked;
                previousRequests[msg.sender].push(requests[i]);
                emit AccessRevoked(msg.sender, _doctor);

                for (uint j = i; j < requests.length - 1; j++) {
                    requests[j] = requests[j + 1];
                }
                requests.pop();
                break;
            }
        }
    }

    function hasAccess(address _patient, address _doctor) public view returns (bool) {
        AccessRequest[] storage requests = accessRequests[_patient];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].doctor == _doctor && requests[i].granted) {
                return true;
            }
        }
        return false;
    }

    function getDataHistory(address _patient) public view returns (Data[] memory) {
        require(msg.sender == _patient || hasAccess(_patient, msg.sender), "Access denied");
        return dataHistory[_patient];
    }

    function getAccessRequests(address _patient) public view returns (AccessRequest[] memory) {
        return accessRequests[_patient];
    }

    function getPreviousRequests(address _patient) public view returns (AccessRequest[] memory) {
        return previousRequests[_patient];
    }
}