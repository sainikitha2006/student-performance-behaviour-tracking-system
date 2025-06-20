import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';

const Login = () => {
    const [formData, setFormData] = useState({
        id: '',
        role: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            document.activeElement &&
            (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')
        ) {
            document.activeElement.blur();
        }
        try {
            const response = await axios.post('http://localhost:5000/api/login', formData);
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', 'dummy-token');
            
            switch(response.data.role) {
                case 'student':
                    navigate('/student-dashboard');
                    break;
                case 'faculty':
                    navigate('/faculty-dashboard');
                    break;
                case 'parent':
                    navigate('/parent-dashboard');
                    break;
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        Student Management System
                    </Typography>
                    <Typography variant="h5" component="h2" align="center" gutterBottom>
                        Login
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                label="Role"
                                required
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="faculty">Faculty</MenuItem>
                                <MenuItem value="parent">Parent</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="ID"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Login
                        </Button>
                    </form>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            New Student?{' '}
                            <Button
                                color="primary"
                                onClick={() => navigate('/register')}
                                sx={{ textTransform: 'none' }}
                            >
                                Register here
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 