import { useState, useEffect } from 'react';
import api from '../api';
import "../styles/Form.css";
import LoadingIndicator from "../components/LoadingIndicator";

function DoctorDashboard() {
    const [patientAddress, setPatientAddress] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedPatientHistory, setSelectedPatientHistory] = useState({ current_data: [], history: [] });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            setRequestLoading(true);
            try {
                const response = await api.get('/api/doctor-requests/');
                setRequests(response.data);
                console.log(response.data)
            } catch (error) {
                alert(error.response?.data?.error || 'An error occurred');
            } finally {
                setRequestLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setRequestLoading(true);

        try {
            await api.post('/api/request-access/', { patient_address: patientAddress });
            alert('Access request submitted successfully');
            setPatientAddress("");
            await fetchRequests();
        } catch (error) {
            alert(error.response?.data?.error || 'An error occurred');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleViewHistory = async (patientAddress) => {
        setShowModal(true);
        setSelectedPatient(patientAddress);
        await fetchPatientHistory(patientAddress);
    };

    const fetchPatientHistory = async (patientAddress) => {
        setHistoryLoading(true);
        try {
            const response = await api.get(`/api/doctor-patient-data/${patientAddress}/`);
            selectedPatientHistory.current_data = response.data.current_data
            selectedPatientHistory.history = response.data.history
        } catch (error) {
            console.error('Error fetching patient history:', error);
            alert(error.response?.data?.error || 'An error occurred');
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <form onSubmit={handleRequestAccess} className="form-container">
                <h1>Request Access to Patient Data</h1>
                <input
                    className="form-input"
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="Patient Address"
                    required
                />
                {requestLoading && <LoadingIndicator />}
                <button className="form-button" type="submit">
                    Request Access
                </button>
            </form>

            <h2>Access Requests</h2>
            {requestLoading ? (
                <LoadingIndicator />
            ) : (
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>Patient Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="2">No requests.</td>
                            </tr>
                        ) : (
                            requests.map((request, index) => (
                                <tr key={index}>
                                    <td>{request[0][1]}</td>
                                    <td>
                                        <button onClick={() => handleViewHistory(request[0][1])}>View History</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

{showModal && selectedPatient && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Patient Data History</h2>
                        {historyLoading ? (
                            <LoadingIndicator />
                        ) : (
                            <table className="data-history-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Height</th>
                                        <th>Weight</th>
                                        <th>Systolic BP</th>
                                        <th>Diastolic BP</th>
                                        <th>Blood Sugar</th>
                                        <th>Symptoms</th>
                                        <th>Diet</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPatientHistory.current_data.length === 0 && selectedPatientHistory.history.length === 0 ? (
                                        <tr>
                                            <td colSpan="10">No data available.</td>
                                        </tr>
                                    ) : (
                                        selectedPatientHistory.history.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data[0]}</td>
                                                <td>{data[1]}</td>
                                                <td>{data[2]} cm</td>
                                                <td>{data[3]} kg</td>
                                                <td>{data[4]} mmHg</td>
                                                <td>{data[5]} mmHg</td>
                                                <td>{data[6]} mg/dL</td>
                                                <td>{data[7]}</td>
                                                <td>{data[8]}</td>
                                                <td>{new Date(data[9]).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorDashboard;