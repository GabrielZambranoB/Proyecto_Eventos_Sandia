import React, { useState, useEffect } from 'react';
import { 
  getCancelaciones, 
  getCancelacion,
  createCancelacion, 
  updateCancelacion,
  deleteCancelacion, 
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
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaCancelaciones() {
  const [cancelaciones, setCancelaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [reservaId, setReservaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [reembolso, setReembolso] = useState(0);
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resCancelaciones, resReservas] = await Promise.all([
        getCancelaciones(),
        getReservas()
      ]);
      setCancelaciones(resCancelaciones.data);
      const canceladasIds = resCancelaciones.data.map(c => c.reserva);
      const currentReservaId = cancelaciones.find(c => c.id === id)?.reserva;
      const reservasActivas = resReservas.data.filter(r => 
        !canceladasIds.includes(r.id) || r.id === currentReservaId
      );
      setReservas(reservasActivas);
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
    setMotivo(item.motivo || '');
    setReembolso(item.reembolso_aplicado || 0);
    setMensaje(null);
    setErrorForm(null);
    fetchData();
  }

  const handleClear = () => {
    setId(null);
    setReservaId('');
    setMotivo('');
    setReembolso(0);
    fetchData(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    const cancelacionData = {
      reserva: reservaId,
      motivo: motivo,
      reembolso_aplicado: reembolso,
      monto_personalizado: 0
    };
    try {
      if (id) {
        await updateCancelacion(id, cancelacionData);
        setMensaje(`¡Cancelación ID ${id} actualizada!`);
      } else {
        await createCancelacion(cancelacionData);
        setMensaje(`¡Reserva #${reservaId} cancelada!`);
      }
      handleClear();
      fetchData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      setErrorForm('Error al procesar la cancelación: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getCancelacion(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar la cancelación para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de cancelación?')) {
      try {
        await deleteCancelacion(itemId);
        setMensaje(`Registro de cancelación ID ${itemId} eliminado con éxito.`);
        fetchData();
      } catch (err) {
        let displayError = 'Error al eliminar el registro. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar este registro debido a una dependencia de datos.';
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
          {id ? 'Editar Registro de Cancelación' : 'Procesar Cancelación de Reserva'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="reserva-select-label">Reserva ({id ? 'Asignada' : 'Activas'})</InputLabel>
                <Select
                  labelId="reserva-select-label"
                  id="reserva-select"
                  value={reservaId}
                  label="Reserva (Activas)"
                  onChange={(e) => setReservaId(e.target.value)}
                  disabled={!!id}
                >
                  <MenuItem value="">
                    <em>Seleccione una reserva a cancelar</em>
                  </MenuItem>
                  {reservas.length > 0 ? (
                    reservas.map(r => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.codigo_reserva} (Cliente ID: {r.cliente})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay reservas activas para cancelar</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Motivo de Cancelación"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Monto Reembolsado ($)"
                type="number"
                value={reembolso}
                onChange={(e) => setReembolso(e.target.value)}
                required
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
              color={id ? 'primary' : 'error'}
              sx={{ py: 1.5 }}
            >
              {id ? 'Actualizar Registro' : 'Confirmar Cancelación'}
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
        Historial de Cancelaciones
      </Typography>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Paper>
          <List>
            {cancelaciones.map((canc, index) => (
              <React.Fragment key={canc.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(canc)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(canc.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <EventBusyIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`Reserva ID: ${canc.reserva}`}
                    secondary={`Motivo: ${canc.motivo} | Reembolso: $${canc.reembolso_aplicado}`}
                  />
                </ListItem>
                {index < cancelaciones.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaCancelaciones;
