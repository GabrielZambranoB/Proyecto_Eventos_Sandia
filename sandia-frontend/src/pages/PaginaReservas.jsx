import React, { useState, useEffect } from 'react';
import { 
  getReservas, 
  getReserva,
  createReserva, 
  updateReserva,
  deleteReserva,
  getUsuarios, 
  getHorarios 
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
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaReservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [horarioId, setHorarioId] = useState('');
  const [codigoReserva, setCodigoReserva] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [direccion, setDireccion] = useState('');
  const [total, setTotal] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resReservas, resUsuarios, resHorarios] = await Promise.all([
        getReservas(),
        getUsuarios(),
        getHorarios()
      ]);
      setReservas(resReservas.data);
      setUsuarios(resUsuarios.data);
      setHorarios(resHorarios.data);
    } catch (err) {
      setError('No se pudo cargar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setClienteId(item.cliente);
    setHorarioId(item.horario);
    setCodigoReserva(item.codigo_reserva);
    setFechaEvento(item.fecha_evento || '');
    setFechaInicio((item.fecha_inicio || '').substring(0, 5)); 
    setDireccion(item.direccion_evento || '');
    setTotal(item.total || '');
    setEstado(item.estado || 'PENDIENTE');
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setClienteId('');
    setHorarioId('');
    setCodigoReserva('');
    setFechaEvento('');
    setFechaInicio('');
    setDireccion('');
    setTotal('');
    setEstado('PENDIENTE');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const reservaData = {
      cliente: clienteId,
      horario: horarioId,
      codigo_reserva: codigoReserva,
      fecha_evento: fechaEvento,
      fecha_inicio: fechaInicio,
      direccion_evento: direccion,
      subtotal: total,
      descuento: 0,
      impuestos: 0,
      total: total,
      estado: estado,
    };

    try {
      if (id) {
        await updateReserva(id, reservaData);
        setMensaje(`¡Reserva ${codigoReserva} actualizada!`);
      } else {
        await createReserva(reservaData);
        setMensaje(`¡Reserva ${codigoReserva} creada!`);
      }
      handleClear();
      fetchData();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.codigo_reserva || error.message;
      setErrorForm('Error al guardar la reserva: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getReserva(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar la reserva para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        await deleteReserva(itemId);
        setMensaje(`Reserva ${itemId} eliminada con éxito.`);
        fetchData();
      } catch (err) {
        let displayError = 'Error al eliminar la reserva. Código 500.';
        if (err.response && err.response.status === 500) {
          displayError = 'No se puede eliminar esta reserva. Primero debe borrar los Pagos y/o Cancelaciones asociados.';
        } else if (err.message) {
          displayError = 'Error al eliminar: ' + err.message;
        }
        setError(displayError);
      }
    }
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.id === id);
    return user ? `${user.nombre} ${user.apellido}` : `ID ${id}`;
  };
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Editar Reserva Existente' : 'Crear Nueva Reserva'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="cliente-select-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-select-label"
                  value={clienteId}
                  label="Cliente"
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <MenuItem value=""><em>Seleccione un cliente</em></MenuItem>
                  {usuarios.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.nombre} {user.apellido}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="horario-select-label">Horario</InputLabel>
                <Select
                  labelId="horario-select-label"
                  value={horarioId}
                  label="Horario"
                  onChange={(e) => setHorarioId(e.target.value)}
                >
                  <MenuItem value=""><em>Seleccione un horario</em></MenuItem>
                  {horarios.map(h => (
                    <MenuItem key={h.id} value={h.id}>{h.fecha} ({h.hora_inicio} - {h.hora_fin})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código de Reserva"
                value={codigoReserva}
                onChange={(e) => setCodigoReserva(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dirección del Evento"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha del Evento"
                type="date"
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Inicio"
                type="time"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total ($)"
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            {id && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="estado-select-label">Estado</InputLabel>
                  <Select
                    labelId="estado-select-label"
                    value={estado}
                    label="Estado"
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                    <MenuItem value="CONFIRMADA">CONFIRMADA</MenuItem>
                    <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
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
              {id ? 'Actualizar Reserva' : 'Guardar Reserva'}
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
        Historial de Reservas
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Si una reserva tiene Pagos o Cancelaciones, debe eliminar esos registros primero para poder borrar la reserva.
      </Alert>
      {!loading && !error && (
        <Paper>
          <List>
            {reservas.map((res, index) => (
              <React.Fragment key={res.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(res)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(res.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <BookOnlineIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`${res.codigo_reserva} - [${res.estado}]`}
                    secondary={`Fecha: ${res.fecha_evento} | Cliente: ${getUserName(res.cliente)} | Total: $${res.total} | Dir: ${res.direccion_evento}`}
                  />
                </ListItem>
                {index < reservas.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
    </Container>
  );
}

export default PaginaReservas;
