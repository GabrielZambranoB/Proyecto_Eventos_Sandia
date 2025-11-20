import React, { useState, useEffect } from 'react';
import { 
  getPagos, 
  getPago, 
  createPago, 
  updatePago, 
  deletePago, 
  getReservas 
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
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaPagos() {
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [reservaId, setReservaId] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPagos, resReservas] = await Promise.all([
        getPagos(),
        getReservas()
      ]);
      setPagos(resPagos.data);
      const pagosHechosIds = resPagos.data.map(p => p.reserva);
      const currentReservaId = pagos.find(p => p.id === id)?.reserva;
      const reservasDisponibles = resReservas.data.filter(r => 
        !pagosHechosIds.includes(r.id) || r.id === currentReservaId
      );
      setReservas(reservasDisponibles);
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
    setReservaId(item.reserva);
    setMonto(item.monto || '');
    setMetodoPago(item.metodo_pago || 'Tarjeta');
    setMensaje(null);
    setErrorForm(null);
    fetchData(); 
  }
  
  const handleClear = () => {
    setId(null);
    setReservaId('');
    setMonto('');
    setMetodoPago('Tarjeta');
    fetchData(); 
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const pagoData = {
      reserva: reservaId,
      monto: monto,
      metodo_pago: metodoPago,
      estado_pago: 'COMPLETADO' 
    };

    try {
      if (id) {
        await updatePago(id, pagoData);
        setMensaje(`¡Pago ID ${id} actualizado!`);
      } else {
        await createPago(pagoData);
        setMensaje(`¡Pago para la reserva #${reservaId} registrado!`);
      }
      handleClear();
      fetchData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.reserva || error.message;
      setErrorForm('Error al guardar el pago: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getPago(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar el pago para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        await deletePago(itemId);
        setMensaje(`Pago ID ${itemId} eliminado con éxito.`);
        fetchData();
      } catch (err) {
        setError('Error al eliminar el pago: ' + err.message);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Editar Pago Existente' : 'Registrar Nuevo Pago'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="reserva-select-label">Reserva ({id ? 'Asignada' : 'Sin Pagar'})</InputLabel>
                <Select
                  labelId="reserva-select-label"
                  id="reserva-select"
                  value={reservaId}
                  label="Reserva (Sin Pagar)"
                  onChange={(e) => setReservaId(e.target.value)}
                  disabled={!!id} 
                >
                  <MenuItem value="">
                    <em>Seleccione una reserva</em>
                  </MenuItem>
                  {reservas.length > 0 ? (
                    reservas.map(r => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.codigo_reserva} (Total: ${r.total})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay reservas disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto ($)"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
                <Select
                  labelId="metodo-pago-label"
                  id="metodo-pago-select"
                  value={metodoPago}
                  label="Método de Pago"
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
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
              {id ? 'Actualizar Pago' : 'Registrar Pago'}
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
        Historial de Pagos
      </Typography>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Paper>
          <List>
            {pagos.map((pago, index) => (
              <React.Fragment key={pago.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(pago)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(pago.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <PaymentIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`Pago ID: ${pago.id} (Reserva ID: ${pago.reserva})`}
                    secondary={`$${pago.monto} - ${pago.metodo_pago} [${pago.estado_pago}]`}
                  />
                </ListItem>
                {index < pagos.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaPagos;
