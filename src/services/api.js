import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; 
export const register = (email, username, unique, password) => {
    return axios.post(`${API_URL}/api/register/`, { email, username, unique, password });
};

export const login = (username, password) => {
    return axios.post(`${API_URL}/api/login/`, { username, password });
};

export const getContact = (username, email) => {
    return axios.post(`${API_URL}/api/contact/`, { username, email });
};

export const addContact = (token, username, email) => {
    return axios.post(`${API_URL}/api/contact/`, { username, email }, { headers: { Authorization: `Bearer ${token}` } });
};

export const sendMessage = (token, unique, message, from_user) => {
    return axios.post(`${API_URL}/api/send_message/`, { unique, message, from_user }, { headers: { Authorization: `Bearer ${token}` } });
};

export const checkMessages = (token, unique) => {
    return axios.get(`${API_URL}/api/check_messages/${unique}/`, { headers: { Authorization: `Bearer ${token}` } });
};
