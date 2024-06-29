import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [unique, setUnique] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [uniqueError, setUniqueError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError('Email is not valid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateUsername = (value) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateUnique = (value) => {
    if (!value) {
      setUniqueError('Unique Identifier is required');
      return false;
    }
    setUniqueError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isUniqueValid = validateUnique(unique);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isUsernameValid && isUniqueValid && isPasswordValid) {
      try {
        const response = await register(email, username, unique, password);
        localStorage.clear(); // Очистить предыдущие данные
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('unique', response.data.unique);
        navigate('/login');
      } catch (error) {
        console.error('Registration error', error);
        setServerError(error.response.data.error || 'An error occurred');
      }
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
          Register
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateEmail(email)}
            helperText={emailError || 'Enter your email address'}
            error={Boolean(emailError)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => validateUsername(username)}
            helperText={usernameError || 'Enter your username'}
            error={Boolean(usernameError)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Unique Identifier"
            value={unique}
            onChange={(e) => setUnique(e.target.value)}
            onBlur={() => validateUnique(unique)}
            helperText={uniqueError || 'Enter a unique identifier'}
            error={Boolean(uniqueError)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => validatePassword(password)}
            helperText={passwordError || 'Enter your password'}
            error={Boolean(passwordError)}
          />
          {serverError && (
            <Typography color="error" variant="body2">
              {serverError}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;