import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { saveMessage, getMessagesByRecipient, updateMessageStatus, saveContact, getRoomId, initDB } from '../services/db';
import { addContact, updateUserDetails } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';


const Messenger = () => {
  const [contacts, setContacts] = useState([]);
  const [openAddContact, setOpenAddContact] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [password, setPassword] = useState('');
  

  const [contactsVisible, setContactsVisible] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleContacts = () => {
    setContactsVisible(!contactsVisible);
  };

  const unique = localStorage.getItem('unique');
  const navigate = useNavigate();

  const wsUrl = process.env.REACT_APP_WS_URL;

  useEffect(() => {
    initDB()
      .then(() => {
        const savedContacts = JSON.parse(localStorage.getItem(`contacts_${unique}`)) || [];
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
  }, [socket, unique]);

  const handleAddContact = async () => {
    try {
      const response = await addContact(newContactUsername, newContactEmail);
      const newContact = {
        username: newContactUsername,
        email: newContactEmail,
        unique: response.data.unique,
        roomId: response.data.room_id,
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem(`contacts_${unique}`, JSON.stringify(updatedContacts));
      await saveContact(newContact);
      setOpenAddContact(false);
    } catch (error) {
      console.error('Error adding contact', error);
      setErrorMessage('Failed to add contact. Please try again.');
      setOpenSnackbar(true);
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
      setErrorMessage('Failed to fetch messages. Please try again.');
      setOpenSnackbar(true);
    }
    if (isMobile) {
      setContactsVisible(false);
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
      setErrorMessage('Failed to send message. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('unique');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSettingsOpen = () => {
    setOpenSettings(true);
    handleSettingsClose();
  };

  const handleSettingsSave = async () => {
    try {
      await updateUserDetails(unique, { username, email, password });
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      setOpenSettings(false);
    } catch (error) {
      console.error('Error updating user details', error);
      setErrorMessage('Failed to update user details. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="2xl" sx={{ display: 'flex', height: '100vh', paddingLeft: '0 !important', paddingRight: '0 !important' }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ width: '30%', height: '100%', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Messenger
            </Typography>
            <IconButton color="inherit" onClick={handleSettingsClick}>
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
            >
              <MenuItem onClick={handleSettingsOpen}>Account Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
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
        <Fab color="primary" aria-label="add" onClick={() => setOpenAddContact(true)} sx={{ position: 'absolute', bottom: 16, left: 16 }}>
          <AddIcon />
        </Fab>
        <Dialog open={openAddContact} onClose={() => setOpenAddContact(false)}>
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
              value={newContactUsername || ''}
              onChange={(e) => setNewContactUsername(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Email Address"
              fullWidth
              variant="standard"
              value={newContactEmail || ''}
              onChange={(e) => setNewContactEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddContact(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Add</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Update your account details below.
            </DialogContentText>
            <TextField
              margin="dense"
              label="Username"
              fullWidth
              variant="standard"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Email Address"
              fullWidth
              variant="standard"
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              label="New Password"
              fullWidth
              variant="standard"
              type="password"
              value={password || ''}
              onChange={(e) => setPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
            <Button onClick={handleSettingsSave}>Save</Button>
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
                value={newMessage || ''}
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