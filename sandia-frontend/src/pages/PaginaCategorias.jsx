import React, { useState, useEffect } from 'react';
import { 
  getCategorias, 
  getCategoria,
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
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
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';

function PaginaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategorias();
      setCategorias(response.data);
    } catch (err) {
      setError('No se pudo cargar las categorías: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setNombre(item.nombre || '');
    setDescripcion(item.descripcion || '');
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setNombre('');
    setDescripcion('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const categoriaData = {
      nombre: nombre,
      descripcion: descripcion,
      activo: true
    };

    try {
      if (id) {
        await updateCategoria(id, categoriaData);
        setMensaje(`¡Categoría "${nombre}" actualizada!`);
      } else {
        await createCategoria(categoriaData);
        setMensaje(`¡Categoría "${nombre}" creada con éxito!`);
      }
      
      handleClear();
      fetchCategorias();
      
    } catch (error) {
      const errorMsg = error.response?.data?.nombre || error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar la categoría: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getCategoria(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar la categoría para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteCategoria(itemId);
        setMensaje(`Categoría ID ${itemId} eliminada con éxito.`);
        fetchCategorias();
      } catch (err) {
        let displayError = 'Error al eliminar la categoría. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar esta categoría porque tiene Servicios asociados.';
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
          {id ? 'Editar Categoría Existente' : 'Crear Nueva Categoría'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre de la Categoría"
            name="nombre"
            autoComplete="off"
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="descripcion"
            label="Descripción (Opcional)"
            id="descripcion"
            autoComplete="off"
            multiline
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          
          {mensaje && <Alert severity="success" sx={{ mt: 2 }}>{mensaje}</Alert>}
          {errorForm && <Alert severity="error" sx={{ mt: 2 }}>{errorForm}</Alert>}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
             <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ py: 1.5 }}
              >
                {id ? 'Actualizar Categoría' : 'Guardar Categoría'}
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
        Lista de Categorías
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <Paper>
          <List>
            {categorias.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(cat)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(cat.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <CategoryIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={cat.nombre}
                    secondary={cat.descripcion || 'Sin descripción'}
                  />
                </ListItem>
                {index < categorias.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaCategorias;
