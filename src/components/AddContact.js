// src/components/AddContact.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContact, addContact } from '../services/api';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

const AddContact = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleAddContact = async () => {
    try {
      const response = await getContact(username, email);
      const newContact = {
        username,
        email,
        unique: response.data.unique,
      };
      const savedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
      const updatedContacts = [...savedContacts, newContact];
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      navigate('/messenger');
    } catch (error) {
      console.error('Error adding contact', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Add Contact
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddContact;
