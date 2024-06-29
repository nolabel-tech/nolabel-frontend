import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';
import { addContact } from '../services/api';  // Удаляем неиспользуемую переменную

const AddContactDialog = ({ open, onClose, onAddContact }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleAddContact = async () => {
    try {
      await addContact(username, email);
      onAddContact();
      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add a contact, please enter their username and email address here.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          variant="standard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Email Address"
          fullWidth
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddContact}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContactDialog;
