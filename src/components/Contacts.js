import React, { useEffect, useState } from 'react';
import { getContact } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await getContact(token);
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts', error);
      }
    };
    fetchContacts();
  }, [token]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography component="h1" variant="h5">
          Contacts
        </Typography>
        <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => navigate('/add-contact')}>
          Add Contact
        </Button>
        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.id}>
              <ListItemText primary={contact.username} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default Contacts;