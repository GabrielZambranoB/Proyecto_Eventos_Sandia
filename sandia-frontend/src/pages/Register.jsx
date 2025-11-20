import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { registerUser } from '../apiService';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ username, password, email, nombre, apellido, telefono });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Crear cuenta</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Usuario" value={username} onChange={e => setUsername(e.target.value)} fullWidth sx={{ mb:2 }} />
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ mb:2 }} />
        <TextField label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mb:2 }} />
        <TextField label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} fullWidth sx={{ mb:2 }} />
        <TextField label="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} fullWidth sx={{ mb:2 }} />
        <TextField label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} fullWidth sx={{ mb:2 }} />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</Button>
      </form>
    </Box>
  );
}
