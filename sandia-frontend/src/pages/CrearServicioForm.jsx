import React, { useState, useEffect } from 'react';
import { createServicio, updateServicio, getCategorias } from '../apiService';

import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

function CrearServicioForm({ onServicioCreado, editItem, setEditItem }) {
  
  const [id, setId] = useState(null); 
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [capacidad, setCapacidad] = useState(1);
  const [categoriaId, setCategoriaId] = useState(''); 
 
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await getCategorias();
        setCategorias(response.data);
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (editItem) {
      setId(editItem.id);
      setNombre(editItem.nombre || '');
      setDescripcion(editItem.descripcion || '');
      setPrecio(editItem.precio_base || '');
      setDuracion(editItem.duracion_horas || 1);
      setCapacidad(editItem.capacidad_persona || 1);
      setCategoriaId(editItem.categoria || '');
      setMensaje(null);
      setErrorForm(null);
    } else {

      setId(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setDuracion(1);
      setCapacidad(1);
      setCategoriaId('');
    }
  }, [editItem]);

  const handleClear = () => {
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);

    const servicioData = {
      nombre,
      descripcion,
      precio_base: precio,
      duracion_horas: duracion,
      capacidad_persona: capacidad,
      categoria: categoriaId || null,
      disponible: true
    }; 

    try {
      if (id) {
        await updateServicio(id, servicioData);
        setMensaje(`¡Servicio "${nombre}" actualizado!`);
      } else {
        const response = await createServicio(servicioData);
        setMensaje(`¡Servicio "${response.data.nombre}" creado!`);
      }
      
      handleClear();
      if (onServicioCreado) {
        onServicioCreado();
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      setErrorForm('Error al guardar el servicio: ' + errorMsg);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {id ? 'Editar Servicio Existente' : 'Crear Nuevo Servicio'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre del Servicio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              fullWidth
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Precio Base ($)"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              fullWidth
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
              label="Duración (horas)"
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Capacidad (personas)"
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="categoria-select-label">Categoría (Opcional)</InputLabel>
              <Select
                labelId="categoria-select-label"
                value={categoriaId}
                label="Categoría (Opcional)"
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <MenuItem value=""><em>Sin categoría</em></MenuItem>
                {categorias.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
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
            {id ? 'Actualizar Servicio' : 'Guardar Servicio'}
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
  );
}

export default CrearServicioForm;