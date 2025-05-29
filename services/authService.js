import { API_BASE } from './Api';

const API_URL = `${API_BASE}/api/auth`; // <-- Cambio aquí

const parseJSON = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('❌ Error parseando JSON:', err);
    console.log('📦 Respuesta cruda del backend:', text);
    throw new Error('Respuesta inesperada del servidor');
  }
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return parseJSON(response);
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJSON(response);
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJSON(response);
};

export const updateRoles = async (userId, roles, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/roles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roles }),
  });
  return parseJSON(response);
};
