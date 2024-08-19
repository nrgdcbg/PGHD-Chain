import { useState, useEffect } from 'react';
import api from '../api'; // Adjust the path as needed
import { ACCESS_TOKEN } from '../constants';

const useAuth = () => {
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (!token) {
                    setUserType(null);
                    setLoading(false);
                    return;
                }

                const response = await api.get('/api/user-type/');
                setUserType(response.data.user_type);
            } catch (error) {
                console.log(error);
                setUserType(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return { userType, loading };
};

export default useAuth;