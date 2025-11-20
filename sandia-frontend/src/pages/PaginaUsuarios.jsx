import React, { useState, useEffect } from 'react';
import { 
  getUsuarios, 
  getUsuario,
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} from '../apiService';

import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState(''); 
  
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      setError('No se pudo cargar los usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [id]);
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setNombre(item.nombre || '');
    setApellido(item.apellido || '');
    setTelefono(item.telefono || '');
    setEmail(item.email || '');
    setContrasena('');
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setNombre('');
    setApellido('');
    setTelefono('');
    setEmail('');
    setContrasena('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const usuarioData = {
      nombre,
      apellido,
      telefono,
      email,
      activo: true
    };
    
    if (contrasena) {
        usuarioData.contrasena = contrasena;
    } else if (!id) {
        setErrorForm('La contraseña es obligatoria para crear un usuario.');
        return;
    }

    try {
      if (id) {
        await updateUsuario(id, usuarioData);
        setMensaje(`¡Usuario ${nombre} ${apellido} actualizado!`);
      } else {
        await createUsuario(usuarioData);
        setMensaje(`¡Usuario ${nombre} registrado con éxito!`);
      }
      
      handleClear();
      fetchUsuarios();
      
    } catch (error) {
      const errorMsg = error.response?.data?.email || error.response?.data?.telefono || error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar el usuario: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getUsuario(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar el usuario para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUsuario(itemId);
        setMensaje(`Usuario ID ${itemId} eliminado con éxito.`);
        fetchUsuarios();
        handleClear();
      } catch (err) {
        let displayError = 'Error al eliminar el usuario. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar este usuario porque tiene Reservas asociadas.';
        } else if (err.message) {
            displayError = 'Error al eliminar: ' + err.message;
        }
        setError(displayError);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Editar Usuario Existente' : 'Registrar Nuevo Usuario'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={id ? 'Contraseña (Dejar vacío para no cambiar)' : 'Contraseña'}
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required={!id}
                fullWidth
              />
            </Grid>
          </Grid>
          {mensaje && <Alert severity="success" sx={{ mt: 2 }}>{mensaje}</Alert>}
          {errorForm && <Alert severity="error" sx={{ mt: 2 }}>{errorForm}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ py: 1.5 }}
            >
              {id ? 'Actualizar Usuario' : 'Registrar Usuario'}
            </Button>
            {id && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                sx={{ py: 1.5, width: '30%' }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Lista de Usuarios
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <Paper>
          <List>
            {usuarios.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(user.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <AccountCircle sx={{ mr: 2 }} /> 
                  <ListItemText
                    primary={`${user.nombre} ${user.apellido}`}
                    secondary={`Email: ${user.email} | Tel: ${user.telefono}`}
                  />
                </ListItem>
                {index < usuarios.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaUsuarios;
