import React, { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  getServicios, 
  deleteServicio,
  getServicio,
  getMe,
  logout as apiLogout
} from './apiService';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import ServiciosList from './pages/ServiciosList';
import CrearServicioForm from './pages/CrearServicioForm';
import PaginaReservas from './pages/PaginaReservas';
import PaginaCategorias from './pages/PaginaCategorias';
import PaginaPromociones from './pages/PaginaPromociones';
import PaginaCombos from './pages/PaginaCombos';
import PaginaUsuarios from './pages/PaginaUsuarios';
import PaginaHorarios from './pages/PaginaHorarios';
import PaginaPagos from './pages/PaginaPagos';
import PaginaCancelaciones from './pages/PaginaCancelaciones';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const paginas = [
  { nombre: 'Reservas', ruta: '/reservas' },
  { nombre: 'Categorías', ruta: '/categorias' },
  { nombre: 'Promociones', ruta: '/promociones' },
  { nombre: 'Combos', ruta: '/combos' },
  { nombre: 'Usuarios', ruta: '/usuarios' },
  { nombre: 'Horarios', ruta: '/horarios' },
  { nombre: 'Pagos', ruta: '/pagos' },
  { nombre: 'Cancelaciones', ruta: '/cancelaciones' },
];

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe().then(r => setCurrentUser(r.data)).catch(() => setCurrentUser(null));
    }
  }, []);

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                flexGrow: { xs: 1, md: 0 },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              APP-SERVICIOS
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {paginas.map((page) => (
                <Button
                  key={page.nombre}
                  component={RouterLink}
                  to={page.ruta}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.nombre}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', ml: 2, alignItems: 'center' }}>
              {currentUser ? (
                <>
                  <Typography sx={{ color: 'white', mr: 2 }}>{currentUser.username}</Typography>
                  <Button onClick={handleLogout} sx={{ color: 'white' }}>Cerrar sesión</Button>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" sx={{ color: 'white' }}>Login</Button>
                  <Button component={RouterLink} to="/register" sx={{ color: 'white', ml: 1 }}>Registro</Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservas" element={<PaginaReservas />} />
          <Route path="/categorias" element={<PaginaCategorias />} />
          <Route path="/promociones" element={<PaginaPromociones />} />
          <Route path="/combos" element={<PaginaCombos />} />
          <Route path="/usuarios" element={<PaginaUsuarios />} />
          <Route path="/horarios" element={<PaginaHorarios />} />
          <Route path="/pagos" element={<PaginaPagos />} />
          <Route path="/cancelaciones" element={<PaginaCancelaciones />} />
        </Routes>
      </Container>
    </Box>
  );
}

function PaginaInicio() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const fetchServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getServicios();
      setServicios(response.data);
    } catch (err) {
      setError('No se pudo cargar los servicios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleCreateOrUpdate = () => {
    fetchServicios();
    setEditItem(null);
  };

  const handleEditClick = (servicio) => {
    getServicio(servicio.id)
      .then(response => {
        setEditItem(response.data);
      })
      .catch(err => {
        setError("Error al cargar el servicio para editar: " + err.message);
      });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await deleteServicio(id);
        fetchServicios();
      } catch (err) {
        setError('Error al eliminar el servicio: ' + err.message);
      }
    }
  };

  return (
    <Box>
      <CrearServicioForm 
        onServicioCreado={handleCreateOrUpdate}
        editItem={editItem}
        setEditItem={setEditItem}
      />
      
      <ServiciosList 
        loading={loading}
        error={error}
        servicios={servicios}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </Box>
  );
}

export default App;
