import axios from 'axios';

// Usa variable de entorno Vite si existe, sino fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
	baseURL: API_URL,
	headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adjuntar token desde localStorage en cada petición
client.interceptors.request.use((config) => {
	const token = localStorage.getItem('access_token');
	if (token) {
		config.headers = config.headers || {};
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

// Manejo de 401: intentar refresh automático y reintentar la petición
client.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response && error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refresh = localStorage.getItem('refresh_token');
			if (refresh) {
				try {
					// Usamos axios directo para evitar entrar de nuevo al interceptor de client
					const res = await axios.post(`${API_URL}/token/refresh/`, { refresh });
					const newAccess = res.data.access;
					setAuthToken(newAccess);
					// Actualizar header y reintentar
					originalRequest.headers = originalRequest.headers || {};
					originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
					return client(originalRequest);
				} catch (e) {
					// Refresh falló: limpiar sesión y redirigir a login
					setAuthToken(null);
					window.location.href = '/login';
					return Promise.reject(error);
				}
			}
			// Sin refresh token: redirigir a login
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

// Auth
export const login = (credentials) => client.post('/token/', credentials);
export const refreshToken = (refresh) => client.post('/token/refresh/', { refresh });
export const registerUser = (data) => client.post('/register/', data);
export const getMe = () => client.get('/me/');

// Servicios
export const getServicios = () => client.get('/servicios/');
export const getServicio = (id) => client.get(`/servicios/${id}/`);
export const createServicio = (data) => client.post('/servicios/', data);
export const updateServicio = (id, data) => client.put(`/servicios/${id}/`, data);
export const deleteServicio = (id) => client.delete(`/servicios/${id}/`);

// Usuarios
export const getUsuarios = () => client.get('/usuarios/');
export const getUsuario = (id) => client.get(`/usuarios/${id}/`);
export const createUsuario = (data) => client.post('/usuarios/', data);
export const updateUsuario = (id, data) => client.put(`/usuarios/${id}/`, data);
export const deleteUsuario = (id) => client.delete(`/usuarios/${id}/`);

// Categorias
export const getCategorias = () => client.get('/categorias/');
export const getCategoria = (id) => client.get(`/categorias/${id}/`);
export const createCategoria = (data) => client.post('/categorias/', data);
export const updateCategoria = (id, data) => client.put(`/categorias/${id}/`, data);
export const deleteCategoria = (id) => client.delete(`/categorias/${id}/`);

// Promociones
export const getPromociones = () => client.get('/promociones/');
export const getPromocion = (id) => client.get(`/promociones/${id}/`);
export const createPromocion = (data) => client.post('/promociones/', data);
export const updatePromocion = (id, data) => client.put(`/promociones/${id}/`, data);
export const deletePromocion = (id) => client.delete(`/promociones/${id}/`);

// Horarios
export const getHorarios = () => client.get('/horarios/');
export const getHorario = (id) => client.get(`/horarios/${id}/`);
export const createHorario = (data) => client.post('/horarios/', data);
export const updateHorario = (id, data) => client.put(`/horarios/${id}/`, data);
export const deleteHorario = (id) => client.delete(`/horarios/${id}/`);

// Combos
export const getCombos = () => client.get('/combos/');
export const getCombo = (id) => client.get(`/combos/${id}/`);
export const createCombo = (data) => client.post('/combos/', data);
export const updateCombo = (id, data) => client.put(`/combos/${id}/`, data);
export const deleteCombo = (id) => client.delete(`/combos/${id}/`);

// Reservas
export const getReservas = () => client.get('/reservas/');
export const getReserva = (id) => client.get(`/reservas/${id}/`);
export const createReserva = (data) => client.post('/reservas/', data);
export const updateReserva = (id, data) => client.put(`/reservas/${id}/`, data);
export const deleteReserva = (id) => client.delete(`/reservas/${id}/`);

// Pagos
export const getPagos = () => client.get('/pagos/');
export const getPago = (id) => client.get(`/pagos/${id}/`);
export const createPago = (data) => client.post('/pagos/', data);
export const updatePago = (id, data) => client.put(`/pagos/${id}/`, data);
export const deletePago = (id) => client.delete(`/pagos/${id}/`);

// Cancelaciones
export const getCancelaciones = () => client.get('/cancelaciones/');
export const getCancelacion = (id) => client.get(`/cancelaciones/${id}/`);
export const createCancelacion = (data) => client.post('/cancelaciones/', data);
export const updateCancelacion = (id, data) => client.put(`/cancelaciones/${id}/`, data);
export const deleteCancelacion = (id) => client.delete(`/cancelaciones/${id}/`);

// Utility: set auth header manually (por ejemplo después del login)
export function setAuthToken(token) {
	if (token) {
		localStorage.setItem('access_token', token);
		client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	} else {
		localStorage.removeItem('access_token');
		delete client.defaults.headers.common['Authorization'];
	}
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete client.defaults.headers.common['Authorization'];
}
