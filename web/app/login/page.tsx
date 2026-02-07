"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Google } from '@mui/icons-material';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f6f7fb',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#676879' }}>
          {isSignUp ? 'Create your Orbit account' : 'Welcome back to Orbit'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <TextField
              fullWidth
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              bgcolor: '#0073ea',
              '&:hover': { bgcolor: '#0060b9' },
              textTransform: 'none',
              py: 1.5,
              mb: 2
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            textTransform: 'none',
            py: 1.5,
            mb: 2,
            borderColor: '#e6e9ef',
            color: '#323338',
            '&:hover': {
              borderColor: '#c4c4c4',
              bgcolor: '#f6f7fb'
            }
          }}
        >
          Continue with Google
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#676879' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              sx={{
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                color: '#0073ea',
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
              }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
