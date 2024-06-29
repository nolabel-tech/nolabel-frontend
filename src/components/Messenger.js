import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Container, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Fab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { saveMessage, getMessagesByRecipient, updateMessageStatus, saveContact, getRoomId, initDB } from '../services/db';
import { addContact } from '../services/api';

const Messenger = () => {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const unique = localStorage.getItem('unique');
  const username = localStorage.getItem('username');
  const wsUrl = process.env.REACT_APP_WS_URL;

  useEffect(() => {
    initDB()
      .then(() => {
        const savedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
        setContacts(savedContacts);
      })
      .catch((error) => {
        console.error('Failed to initialize database', error);
      });

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const handleAddContact = async () => {
    try {
      const response = await addContact(newContactUsername, newContactEmail);
      const newContact = {
        username: newContactUsername,
        email: newContactEmail,
        unique: response.data.unique,
        roomId: response.data.room_id
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      await saveContact(newContact);
      setOpen(false);
    } catch (error) {
      console.error('Error adding contact', error);
    }
  };

  const handleContactClick = async (contact) => {
    setCurrentChat(contact);
    try {
      const contactMessages = await getMessagesByRecipient(unique, contact.unique);
      setMessages(contactMessages);

      if (socket) {
        socket.close();
      }

      const roomId = contact.roomId || await getRoomId(contact.unique);
      const socketInstance = new WebSocket(`${wsUrl}${roomId}/`);
      setSocket(socketInstance);

      socketInstance.onopen = () => {
        console.log('WebSocket Client Connected');
      };

      socketInstance.onmessage = (event) => {
        console.log('Received message from WebSocket', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          const message = data.message;
          // Проверяем, что сообщение пришло от другого пользователя
          if (message.sender_unique !== unique) {
            setMessages((prevMessages) => [...prevMessages, message]);
            saveMessage(message).catch(error => console.error('Error saving received message', error));
            updateMessageStatus(message.id, 'delivered')
              .catch(error => console.error('Error updating message status', error));
          }
        }
      };

      socketInstance.onclose = (event) => {
        console.log('WebSocket Client Disconnected', event);
      };

      socketInstance.onerror = (error) => {
        console.log('WebSocket Client Error', error);
      };
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    const message = {
      id: Date.now(),
      content: newMessage,
      sender_username: username,
      recipient_unique: currentChat.unique,
      sender_unique: unique,
      status: 'pending',
      date: new Date().toISOString(),
    };
    console.log('Sending message:', message);
    try {
      await saveMessage(message);
      setMessages((prevMessages) => [...prevMessages, message]);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'message', message }));
      } else {
        console.error('WebSocket is not open. Ready state:', socket.readyState);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh', p: 0 }}>
      <Box sx={{ width: '30%', height: '100%', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Messenger
            </Typography>
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <List>
          {contacts.map((contact, index) => (
            <ListItem key={index} button onClick={() => handleContactClick(contact)}>
              <ListItemAvatar>
                <Avatar>{contact.username.charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={contact.username} />
            </ListItem>
          ))}
        </List>
        <Fab color="primary" aria-label="add" onClick={() => setOpen(true)} sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <AddIcon />
        </Fab>
        <Dialog open={open} onClose={() => setOpen(false)}>
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
              value={newContactUsername}
              onChange={(e) => setNewContactUsername(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Email Address"
              fullWidth
              variant="standard"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box sx={{ width: '70%', height: '100%', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        {currentChat ? (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ padding: 2, borderBottom: 1, borderColor: 'divider' }}>Chat with {currentChat.username}</Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
              {messages.map((message, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  <Typography variant="body1"><strong>{message.sender_username}:</strong> {message.content}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ padding: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button color="primary" variant="contained" onClick={handleSendMessage} sx={{ marginLeft: 2 }}>
                <SendIcon />
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="h5" sx={{ padding: 2 }}>Select a contact to start chatting</Typography>
        )}
      </Box>
    </Container>
  );
};

export default Messenger;
