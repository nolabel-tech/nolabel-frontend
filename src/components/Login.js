import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validateUsername = (value) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    setUsernameError('');
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

  const handleLogin = async () => {
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (isUsernameValid && isPasswordValid) {
      try {
        const response = await login(username, password);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('unique', response.data.unique);
        localStorage.setItem('username', username);
        navigate('/messenger');
      } catch (error) {
        console.error('Login error', error);
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
          Login
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
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
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
          >
            Если нет аккаунта, зарегистрируйтесь.
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;