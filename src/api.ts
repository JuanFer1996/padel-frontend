export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Aseguramos borrar al usuario también
}

// CORRECCIÓN CLAVE: Leemos el usuario directamente del LocalStorage
export function getUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
}