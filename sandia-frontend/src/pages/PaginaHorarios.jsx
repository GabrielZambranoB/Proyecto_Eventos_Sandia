import React, { useState, useEffect } from 'react';
import { 
  getHorarios, 
  getHorario,
  createHorario, 
  updateHorario, 
  deleteHorario 
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PaginaHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [capacidad, setCapacidad] = useState(1);
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  const fetchHorarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHorarios();
      setHorarios(response.data);
    } catch (err) {
      setError('No se pudo cargar los horarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, [id]); 
  
  const fillFormForEdit = (item) => {
    setId(item.id);
    setFecha(item.fecha || ''); 
    setHoraInicio((item.hora_inicio || '').substring(0, 5)); 
    setHoraFin((item.hora_fin || '').substring(0, 5));
    setCapacidad(item.capacidad_reserva || 1);
    setMensaje(null);
    setErrorForm(null);
  }

  const handleClear = () => {
    setId(null);
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setCapacidad(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);
    
    const horarioData = {
      fecha: fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      capacidad_reserva: capacidad,
      disponible: true
    };

    try {
      if (id) {
        await updateHorario(id, horarioData);
        setMensaje(`¡Horario actualizado para ${fecha}!`);
      } else {
        await createHorario(horarioData);
        setMensaje(`¡Horario creado para ${fecha}!`);
      }
      
      handleClear();
      fetchHorarios();
      
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors || error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar el horario: ' + errorMsg);
      console.error(error.response ? error.response.data : error.message);
    }
  };
  
  const handleEditClick = (item) => {
    getHorario(item.id)
      .then(response => fillFormForEdit(response.data))
      .catch(err => setError('Error al cargar el horario para edición: ' + err.message));
  };
  
  const handleDeleteClick = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await deleteHorario(itemId);
        setMensaje(`Horario ID ${itemId} eliminado con éxito.`);
        fetchHorarios();
        handleClear();
      } catch (err) {
        let displayError = 'Error al eliminar el horario. Código 500.';
        if (err.response && err.response.status === 500) {
            displayError = 'No se puede eliminar este horario porque tiene Reservas asignadas.';
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
          {id ? 'Editar Horario Existente' : 'Crear Nuevo Horario Disponible'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                fullWidth
                autoFocus
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora Inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora Fin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Capacidad de Reserva (Personas)"
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
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
              sx={{ py: 1.5 }}
            >
              {id ? 'Actualizar Horario' : 'Guardar Horario'}
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
        Lista de Horarios Disponibles
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <Paper>
          <List>
            {horarios.map((h, index) => (
              <React.Fragment key={h.id}>
                <ListItem
                   secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(h)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(h.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <AccessTimeIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`Fecha: ${h.fecha}`}
                    secondary={`Horario: ${h.hora_inicio} - ${h.hora_fin} | Capacidad: ${h.capacidad_reserva} personas`}
                  />
                </ListItem>
                {index < horarios.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default PaginaHorarios;
