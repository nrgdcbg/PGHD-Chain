import { useState, useEffect } from 'react';
import api from '../api';
import "../styles/Form.css";
import LoadingIndicator from "../components/LoadingIndicator";

function PatientDashboard() {
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");
    const [bloodsugar, setBloodsugar] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [diet, setDiet] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [patientData, setPatientData] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    const [accessRequests, setAccessRequests] = useState([]);
    const [previousRequests, setPreviousRequests] = useState([]);
    const [requestLoading, setRequestLoading] = useState(true);
    
    const [dataHistory, setDataHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await api.get('/api/patient-data/');
                setPatientData(response.data);
            } catch (error) {
                setError(error.response?.data?.error || 'An error occurred');
            } finally {
                setFetchLoading(false);
            }
        };

        const fetchAccessRequests = async () => {
            try {
                const response = await api.get('/api/access-requests/');
                setAccessRequests(response.data);
            } catch (error) {
                setError(error.response?.data?.error || 'An error occurred');
            } finally {
                setRequestLoading(false);
            }
        };

        const fetchPreviousRequests = async () => {
            try {
                const response = await api.get('/api/previous-requests/');
                setPreviousRequests(response.data);
            } catch (error) {
                setError(error.response?.data?.error || 'An error occurred');
            } finally {
                setRequestLoading(false);
            }
        };

        const fetchDataHistory = async () => {
            try {
                const response = await api.get('/api/patient-data-history/');
                setDataHistory(response.data);
            } catch (error) {
                setError(error.response?.data?.error || 'An error occurred');
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchPatientData();
        fetchAccessRequests();
        fetchPreviousRequests();
        fetchDataHistory();
    }, []);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const data = {
                age: parseInt(age),
                height: parseInt(height),
                weight: parseInt(weight),
                systolic: parseInt(systolic),
                diastolic: parseInt(diastolic),
                bloodsugar: parseInt(bloodsugar),
                symptoms,
                diet,
            };

            await api.post('/api/add-patient-data/', data);
            alert('Patient data added successfully');
        } catch (error) {
            alert(error.response?.data?.detail || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAccess = async (doctorAddress) => {
        try {
            const timeGranted = Math.floor(Date.now() / 1000);
            await api.post('/api/approve-access/', { doctor_address: doctorAddress, time_granted: timeGranted });
            alert('Access granted successfully');
            setAccessRequests(accessRequests.filter(req => req.doctor !== doctorAddress));
        } catch (error) {
            alert(error.response?.data?.error || 'An error occurred');
        }
    };

    const handleRevokeAccess = async (doctorAddress) => {
        try {
            const timeRevoked = Math.floor(Date.now() / 1000);  
            await api.post('/api/revoke-access/', { doctor_address: doctorAddress, time_revoked: timeRevoked });
            alert('Access revoked successfully');
            setAccessRequests(accessRequests.filter(req => req.doctor !== doctorAddress));
        } catch (error) {
            alert(error.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="dashboard-container">
            <form onSubmit={handleSubmit} className="form-container">
                <h1>Add Patient Data</h1>
                <input
                    className="form-input"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    required
                />
                <input
                    className="form-input"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Height (in cm)"
                    required
                />
                <input
                    className="form-input"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Weight (in kg)"
                    required
                />
                <input
                    className="form-input"
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="Systolic Blood Pressure (in mmHg)"
                    required
                />
                <input
                    className="form-input"
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="Diastolic Blood Pressure (in mmHg)"
                    required
                />
                <input
                    className="form-input"
                    type="number"
                    value={bloodsugar}
                    onChange={(e) => setBloodsugar(e.target.value)}
                    placeholder="Blood Sugar Level (mg/dL)"
                    required
                />
                <input
                    className="form-input"
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Symptoms"
                    required
                />
                <input
                    className="form-input"
                    type="text"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    placeholder="Diet"
                    required
                />
                {loading && <LoadingIndicator />}
                <button className="form-button" type="submit">
                    Submit
                </button>
            </form>

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
                        {[patientData, ...dataHistory].filter(Boolean).sort((a, b) => b.timestamp - a.timestamp).map((data, index) => (
                            <tr key={index}>
                                <td>{data.name || 'N/A'}</td>
                                <td>{data.age || 'N/A'}</td>
                                <td>{data.height ? `${data.height} cm` : 'N/A'}</td>
                                <td>{data.weight ? `${data.weight} kg` : 'N/A'}</td>
                                <td>{data.systolic ? `${data.systolic} mmHg` : 'N/A'}</td>
                                <td>{data.diastolic ? `${data.diastolic} mmHg` : 'N/A'}</td>
                                <td>{data.bloodsugar ? `${data.bloodsugar} mg/dL` : 'N/A'}</td>
                                <td>{data.symptoms || 'N/A'}</td>
                                <td>{data.diet || 'N/A'}</td>
                                <td>{data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2>Access Requests</h2>
            {requestLoading ? (
                <LoadingIndicator />
            ) : (
                <div className="access-requests">
                    {accessRequests.length === 0 ? (
                        <p>No current access requests.</p>
                    ) : (
                        <ul>
                            {accessRequests.map((request, index) => (
                                <li key={index}>
                                    <p>Doctor Address: {request[0]}</p>
                                    <button onClick={() => handleApproveAccess(request[0])}>Approve</button>
                                    <button onClick={() => handleRevokeAccess(request[0])}>Revoke</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <h2>Previous Access Requests</h2>
            {requestLoading ? (
                <LoadingIndicator />
            ) : (
                <div className="previous-requests">
                    {previousRequests.length === 0 ? (
                        <p>No previous access requests.</p>
                    ) : (
                        <ul>
                            {previousRequests.map((request, index) => (
                                <li key={index}>
                                    <p>Doctor Address: {request[0]}</p>
                                    <p>Time Granted: {new Date(request[3] * 1000).toLocaleString()}</p>
                                    <p>Time Revoked: {new Date(request[4] * 1000).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default PatientDashboard;
