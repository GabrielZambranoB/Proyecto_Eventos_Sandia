import React, { useState, useEffect } from 'react';
import { 
  getCombos, 
  getCombo,
  createCombo, 
  updateCombo, 
  deleteCombo, 
  getPromociones 
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaCombos() {
  const [combos, setCombos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioCombo, setPrecioCombo] = useState('');
  const [promocionId, setPromocionId] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resCombos, resPromociones] = await Promise.all([
        getCombos(),
        getPromociones()
      ]);
      setCombos(resCombos.data);
      setPromociones(resPromociones.data);
    } catch (err) {
      setError('No se pudo cargar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]); 
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setNombre(item.nombre || '');
    setDescripcion(item.descripcion || '');
    setPrecioCombo(item.precio_combo || '');
    setPromocionId(item.promocion || ''); 
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setNombre('');
    setDescripcion('');
    setPrecioCombo('');
    setPromocionId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const comboData = {
      nombre,
      descripcion,
      precio_combo: precioCombo,
      promocion: promocionId || null, 
      activo: true,
    };

    try {
      if (id) {
        await updateCombo(id, comboData);
        setMensaje(`¡Combo "${nombre}" actualizado!`);
      } else {
        await createCombo(comboData);
        setMensaje(`¡Combo "${nombre}" creado con éxito!`);
      }
      
      handleClear();
      fetchData(); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.nombre || error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar el combo: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getCombo(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar el combo para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este combo?')) {
      try {
        await deleteCombo(itemId);
        setMensaje(`Combo ID ${itemId} eliminado con éxito.`);
        fetchData();
        handleClear();
      } catch (err) {
        let displayError = 'Error al eliminar el combo. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar este combo. Primero debe borrar los servicios de combo y/o detalles de reserva asociados.';
        } else if (err.message) {
            displayError = 'Error al eliminar: ' + err.message;
        }
        setError(displayError);
      }
    }
  };
  
  const getPromoName = (id) => {
    const promo = promociones.find(p => p.id === id);
    return promo ? `(${promo.nombre})` : '';
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Editar Combo Existente' : 'Crear Nuevo Combo'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del Combo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio Combo ($)"
                type="number"
                value={precioCombo}
                onChange={(e) => setPrecioCombo(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="promocion-select-label">Promoción (Opcional)</InputLabel>
                <Select
                  labelId="promocion-select-label"
                  id="promocion-select"
                  value={promocionId}
                  label="Promoción (Opcional)"
                  onChange={(e) => setPromocionId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Sin promoción</em>
                  </MenuItem>
                  {promociones.map(promo => (
                    <MenuItem key={promo.id} value={promo.id}>
                      {promo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {id ? 'Actualizar Combo' : 'Guardar Combo'}
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
        Lista de Combos
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <Paper>
          <List>
            {combos.map((combo, index) => (
              <React.Fragment key={combo.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(combo)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(combo.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <AllInclusiveIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`${combo.nombre} ${getPromoName(combo.promocion)}`}
                    secondary={`Precio: $${combo.precio_combo}`}
                  />
                </ListItem>
                {index < combos.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaCombos;
