import React, { useState, useEffect } from 'react';
import { 
  getPromociones, 
  getPromocion,
  createPromocion, 
  updatePromocion, 
  deletePromocion 
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
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState('');
  const [descuentoMonto, setDescuentoMonto] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchPromociones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPromociones();
      setPromociones(response.data);
    } catch (err) {
      setError('No se pudo cargar las promociones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromociones();
  }, []);
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setNombre(item.nombre || '');
    setDescripcion(item.descripcion || '');
    setFechaInicio((item.fecha_inicio || '').slice(0, 16)); 
    setFechaFin((item.fecha_fin || '').slice(0, 16));
    setDescuentoPorcentaje(item.descuento_porcentaje || '');
    setDescuentoMonto(item.descuento_monto || '');
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setNombre('');
    setDescripcion('');
    setDescuentoPorcentaje('');
    setDescuentoMonto('');
    setFechaInicio('');
    setFechaFin('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const promocionData = {
      nombre,
      descripcion,
      descuento_porcentaje: descuentoPorcentaje || null,
      descuento_monto: descuentoMonto || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      activo: true
    };

    try {
      if (id) {
        await updatePromocion(id, promocionData);
        setMensaje(`¡Promoción "${nombre}" actualizada!`);
      } else {
        await createPromocion(promocionData);
        setMensaje(`¡Promoción "${nombre}" creada con éxito!`);
      }
      
      handleClear();
      fetchPromociones();
      
    } catch (error) {
      const errorMsg = error.response?.data?.nombre || error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar la promoción: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getPromocion(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar la promoción para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        await deletePromocion(itemId);
        setMensaje(`Promoción ID ${itemId} eliminada con éxito.`);
        fetchPromociones();
        handleClear();
      } catch (err) {
        let displayError = 'Error al eliminar la promoción. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar esta promoción porque tiene Combos asociados.';
        } else if (err.message) {
            displayError = 'Error al eliminar: ' + err.message;
        }
        setError(displayError);
      }
    }
  };

  const formatDiscount = (promo) => {
    if (promo.descuento_porcentaje) return `${promo.descuento_porcentaje}% OFF`;
    if (promo.descuento_monto) return `$${promo.descuento_monto} OFF`;
    return 'Sin Descuento';
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Editar Promoción Existente' : 'Crear Nueva Promoción'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre de la Promoción"
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
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descuento (%)"
                type="number"
                value={descuentoPorcentaje}
                onChange={(e) => setDescuentoPorcentaje(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descuento ($)"
                type="number"
                value={descuentoMonto}
                onChange={(e) => setDescuentoMonto(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha Inicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha Fin"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
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
              {id ? 'Actualizar Promoción' : 'Guardar Promoción'}
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
        Lista de Promociones
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <Paper>
          <List>
            {promociones.map((promo, index) => (
              <React.Fragment key={promo.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(promo)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(promo.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <LoyaltyIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={promo.nombre}
                    secondary={`Descuento: ${formatDiscount(promo)} | Válido hasta: ${new Date(promo.fecha_fin).toLocaleDateString()}`}
                  />
                </ListItem>
                {index < promociones.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaPromociones;
