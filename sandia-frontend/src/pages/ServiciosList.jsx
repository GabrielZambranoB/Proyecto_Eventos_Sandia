import React from 'react';
import {
  Typography,
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
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ServiciosList({ loading, error, servicios, onEdit, onDelete }) {

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Lista de Servicios
      </Typography>
      
      <Paper>
        <List>
          {servicios.map((servicio, index) => (
            <React.Fragment key={servicio.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit(servicio)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(servicio.id)} sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <DesignServicesIcon sx={{ mr: 2 }} />
                <ListItemText
                  primary={servicio.nombre}
                  secondary={`Descripción: ${servicio.descripcion} | Precio: $${servicio.precio_base}`}
                />
              </ListItem>
              {index < servicios.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default ServiciosList;
