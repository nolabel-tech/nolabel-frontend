import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Contacts from './components/Contacts';
import AddContact from './components/AddContact';
import Messenger from './components/Messenger';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;