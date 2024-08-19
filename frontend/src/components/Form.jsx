import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [userType, setUserType] = useState("")
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const data = method === "login" ? { username, password } : {
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                email,
                user_type: userType,
                address,
            };

            const res = await api.post(route, data);

            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                
                const userTypeResponse = await api.get('/api/user-type/');
                const userType = userTypeResponse.data.user_type;

                if (userType === 1) {
                    navigate("/doctor-dashboard");
                } else if (userType === 2) {
                    navigate("/patient-dashboard");
                }
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error.response?.data?.detail || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            {method === "register" && (
                <>
                    <input
                        className="form-input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                    />
                    <input
                        className="form-input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                    />
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <select
                        className="form-input"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        placeholder="User Type"
                        required
                    >
                        <option value="">Select User Type</option>
                        <option value={1}>Doctor</option>
                        <option value=  {2}>Patient</option>
                    </select>
                    <input
                        className="form-input"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                    />
                </>
            )}
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form;    