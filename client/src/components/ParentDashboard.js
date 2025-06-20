import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Grid,
    Card,
    CardContent
} from '@mui/material';

const ParentDashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [student, setStudent] = useState(null);
    const [activities, setActivities] = useState([]);
    const [behaviorRecords, setBehaviorRecords] = useState([]);
    const [disciplinaryActions, setDisciplinaryActions] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, activitiesRes, behaviorRes, disciplinaryRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/parent/${user.id}/student`),
                    axios.get(`http://localhost:5000/api/student/${user.id}/activities`),
                    axios.get(`http://localhost:5000/api/student/${user.id}/behavior`),
                    axios.get(`http://localhost:5000/api/student/${user.id}/disciplinary`)
                ]);
                setStudent(studentRes.data);
                setActivities(activitiesRes.data);
                setBehaviorRecords(behaviorRes.data);
                setDisciplinaryActions(disciplinaryRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again.');
            }
        };
        fetchData();
    }, [user.id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenDialog = (activity) => {
        setSelectedActivity(activity);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedActivity(null);
    };

    const getBehaviorColor = (type) => {
        switch (type) {
            case 'Good Conduct':
            case 'Excellent Performance':
                return 'success';
            case 'Late Submission':
            case 'Attendance Issue':
                return 'warning';
            case 'Disruptive Behavior':
                return 'error';
            default:
                return 'default';
        }
    };

    if (!student) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome, {user.name}
                    </Typography>
                    <Alert severity="info">
                        Loading student information...
                    </Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.name}
                </Typography>

                {/* Student Information */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Student Information
                                </Typography>
                                <Typography>
                                    <strong>Name:</strong> {student.name}
                                </Typography>
                                <Typography>
                                    <strong>Program:</strong> {student.program}
                                </Typography>
                                <Typography>
                                    <strong>Year:</strong> {student.year}
                                </Typography>
                                <Typography>
                                    <strong>Department:</strong> {student.department}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Contact Information
                                </Typography>
                                <Typography>
                                    <strong>Student Contact:</strong> {student.contact}
                                </Typography>
                                <Typography>
                                    <strong>Address:</strong> {student.address}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Activities" />
                        <Tab label="Behavior Records" />
                        <Tab label="Disciplinary Actions" />
                    </Tabs>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {tabValue === 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Activity Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activities.map((activity) => (
                                    <TableRow key={activity.activity_id}>
                                        <TableCell>{activity.name}</TableCell>
                                        <TableCell>{activity.type}</TableCell>
                                        <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleOpenDialog(activity)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tabValue === 1 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Behavior Type</TableCell>
                                    <TableCell>Remarks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {behaviorRecords.map((record) => (
                                    <TableRow key={record.record_id}>
                                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.behaviour_type}
                                                color={getBehaviorColor(record.behaviour_type)}
                                            />
                                        </TableCell>
                                        <TableCell>{record.remarks}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tabValue === 2 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Violation</TableCell>
                                    <TableCell>Action Taken</TableCell>
                                    <TableCell>Faculty</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {disciplinaryActions.map((action) => (
                                    <TableRow key={action.action_id}>
                                        <TableCell>{new Date(action.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{action.violation}</TableCell>
                                        <TableCell>{action.action_taken}</TableCell>
                                        <TableCell>{action.faculty_name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Activity Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedActivity?.name}</DialogTitle>
                <DialogContent>
                    {selectedActivity && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Type:</strong> {selectedActivity.type}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Date:</strong> {new Date(selectedActivity.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Description:</strong>
                            </Typography>
                            <Typography variant="body1">
                                {selectedActivity.description}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ParentDashboard; 