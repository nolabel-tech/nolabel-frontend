import React, { useEffect, useState } from 'react';
import { checkMessages, sendMessage } from '../services/api';
import { Container, Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const unique = localStorage.getItem('unique');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await checkMessages(token, unique);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    };
    fetchMessages();
  }, [token, unique]);

  const handleSendMessage = async () => {
    try {
      await sendMessage(token, 'recipient-unique', newMessage, unique);
      setNewMessage('');
      const response = await checkMessages(token, unique);
      setMessages(response.data);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

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
          Chat
        </Typography>
        <List sx={{ height: '400px', overflowY: 'scroll' }}>
          {messages.map((msg) => (
            <ListItem key={msg.id}>
              <ListItemText primary={msg.content} secondary={msg.sender_username} />
            </ListItem>
          ))}
        </List>
        <TextField
          fullWidth
          label="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default Chat;