import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Badge,
    Divider,
    Fab,
    Tooltip,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Message as MessageIcon,
    Email as EmailIcon,
    Announcement as AnnouncementIcon,
    CalendarToday as CalendarIcon,
    Send as SendIcon,
    Notifications as NotificationsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openActivityDialog, setOpenActivityDialog] = useState(false);
    const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
    const [openBehaviorDialog, setOpenBehaviorDialog] = useState(false);
    const [openDisciplinaryDialog, setOpenDisciplinaryDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [behaviorData, setBehaviorData] = useState({
        behavior_type: '',
        remarks: ''
    });
    const [disciplinaryData, setDisciplinaryData] = useState({
        violation: '',
        action_taken: ''
    });
    const [activityData, setActivityData] = useState({
        activity_id: '',
        name: '',
        type: '',
        date: '',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, activitiesRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/faculty/${user.id}/students`),
                    axios.get('http://localhost:5000/api/activities')
                ]);
                setStudents(studentsRes.data);
                setActivities(activitiesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again.');
            }
        };
        fetchData();
    }, [user.id]);

    // Add logout handler
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Add authentication check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenActivityDialog = () => {
        setOpenActivityDialog(true);
    };

    const handleCloseActivityDialog = () => {
        setOpenActivityDialog(false);
        setActivityData({
            activity_id: '',
            name: '',
            type: '',
            date: '',
            description: ''
        });
    };

    const handleOpenEnrollDialog = (activity) => {
        setSelectedActivity(activity);
        setOpenEnrollDialog(true);
    };

    const handleCloseEnrollDialog = () => {
        setOpenEnrollDialog(false);
        setSelectedActivity(null);
    };

    const handleOpenBehaviorDialog = (studentId) => {
        setSelectedStudent(studentId);
        setOpenBehaviorDialog(true);
    };

    const handleCloseBehaviorDialog = () => {
        setOpenBehaviorDialog(false);
        setSelectedStudent('');
        setBehaviorData({ behavior_type: '', remarks: '' });
    };

    const handleBehaviorSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/faculty/behavior', {
                student_id: selectedStudent,
                faculty_id: user.id,
                ...behaviorData
            });
            setSuccess(response.data.message || 'Behavior record added successfully');
            handleCloseBehaviorDialog();
        } catch (error) {
            console.error('Error submitting behavior record:', error);
            setError(error.response?.data?.error || 'Failed to add behavior record. Please try again.');
        }
    };

    const handleActivitySubmit = async () => {
        try {
            // Validate required fields
            if (!activityData.activity_id || !activityData.name || !activityData.type || !activityData.date) {
                setError('Please fill in all required fields');
                return;
            }

            await axios.post('http://localhost:5000/api/activity', activityData);
            setSuccess('Activity created successfully');
            handleCloseActivityDialog();
            
            // Refresh activities
            const response = await axios.get('http://localhost:5000/api/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Error creating activity:', error);
            setError('Failed to create activity. Please try again.');
        }
    };

    const handleEnrollStudent = async (studentId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/activity/enroll', {
                student_id: studentId,
                activity_id: selectedActivity.activity_id
            });
            setSuccess(response.data.message || 'Student enrolled successfully');
            handleCloseEnrollDialog();
        } catch (error) {
            console.error('Error enrolling student:', error);
            setError(error.response?.data?.error || 'Failed to enroll student. Please try again.');
        }
    };

    const handleOpenDisciplinaryDialog = (studentId) => {
        console.log('Opening disciplinary dialog for student:', studentId);
        setDisciplinaryData({
            student_id: studentId,
            violation: '',
            action_taken: ''
        });
        setOpenDisciplinaryDialog(true);
    };

    const handleCloseDisciplinaryDialog = () => {
        setOpenDisciplinaryDialog(false);
        setDisciplinaryData({
            student_id: '',
            violation: '',
            action_taken: ''
        });
    };

    const handleDisciplinarySubmit = async () => {
        try {
            console.log('Sending disciplinary data:', {
                ...disciplinaryData,
                faculty_id: user.id
            });
            const response = await axios.post('http://localhost:5000/api/faculty/disciplinary', {
                ...disciplinaryData,
                faculty_id: user.id
            });
            setSuccess(response.data.message || 'Disciplinary action recorded successfully');
            handleCloseDisciplinaryDialog();
        } catch (error) {
            console.error('Error recording disciplinary action:', error);
            setError(error.response?.data?.error || 'Failed to record disciplinary action. Please try again.');
        }
    };

    const handleCloseSnackbar = () => {
        setError('');
        setSuccess('');
    };

    return (
        <Container maxWidth="lg">
            <AppBar position="static" sx={{ mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Faculty Dashboard
                    </Typography>
                    <Button 
                        color="inherit" 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.name}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Students" />
                        <Tab label="Activities" />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Program</TableCell>
                                        <TableCell>Year</TableCell>
                                        <TableCell>Parent Name</TableCell>
                                        <TableCell>Parent Contact</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.student_id}>
                                            <TableCell>{student.student_id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.program}</TableCell>
                                            <TableCell>{student.year}</TableCell>
                                            <TableCell>{student.parent_name}</TableCell>
                                            <TableCell>{student.parent_contact}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleOpenBehaviorDialog(student.student_id)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Add Behavior
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        console.log('Button clicked for student:', student.student_id);
                                                        handleOpenDisciplinaryDialog(student.student_id);
                                                    }}
                                                >
                                                    Add Disciplinary
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box>
                        <Button
                            variant="contained"
                            onClick={handleOpenActivityDialog}
                            sx={{ mb: 2 }}
                        >
                            Create New Activity
                        </Button>
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
                                                    onClick={() => handleOpenEnrollDialog(activity)}
                                                >
                                                    Manage Students
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>

            {/* Create Activity Dialog */}
            <Dialog open={openActivityDialog} onClose={handleCloseActivityDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Activity</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Activity ID"
                        value={activityData.activity_id}
                        onChange={(e) => setActivityData({ ...activityData, activity_id: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Activity Name"
                        value={activityData.name}
                        onChange={(e) => setActivityData({ ...activityData, name: e.target.value })}
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            value={activityData.type}
                            onChange={(e) => setActivityData({ ...activityData, type: e.target.value })}
                            label="Activity Type"
                            required
                        >
                            <MenuItem value="Academic">Academic</MenuItem>
                            <MenuItem value="Sports">Sports</MenuItem>
                            <MenuItem value="Cultural">Cultural</MenuItem>
                            <MenuItem value="Workshop">Workshop</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={activityData.date}
                        onChange={(e) => setActivityData({ ...activityData, date: e.target.value })}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        value={activityData.description}
                        onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActivityDialog}>Cancel</Button>
                    <Button onClick={handleActivitySubmit} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Enroll Students Dialog */}
            <Dialog open={openEnrollDialog} onClose={handleCloseEnrollDialog} maxWidth="md" fullWidth>
                <DialogTitle>Enroll Students in {selectedActivity?.name}</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Year</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.student_id}>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.department}</TableCell>
                                        <TableCell>{student.year}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleEnrollStudent(student.student_id)}
                                            >
                                                Enroll
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEnrollDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Behavior Record Dialog */}
            <Dialog open={openBehaviorDialog} onClose={handleCloseBehaviorDialog}>
                <DialogTitle>Add Behavior Record</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Behavior Type</InputLabel>
                        <Select
                            value={behaviorData.behavior_type}
                            onChange={(e) => setBehaviorData({ ...behaviorData, behavior_type: e.target.value })}
                            label="Behavior Type"
                        >
                            <MenuItem value="Good Conduct">Good Conduct</MenuItem>
                            <MenuItem value="Late Submission">Late Submission</MenuItem>
                            <MenuItem value="Excellent Performance">Excellent Performance</MenuItem>
                            <MenuItem value="Attendance Issue">Attendance Issue</MenuItem>
                            <MenuItem value="Disruptive Behavior">Disruptive Behavior</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Remarks"
                        multiline
                        rows={4}
                        value={behaviorData.remarks}
                        onChange={(e) => setBehaviorData({ ...behaviorData, remarks: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBehaviorDialog}>Cancel</Button>
                    <Button onClick={handleBehaviorSubmit} variant="contained">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Disciplinary Action Dialog */}
            <Dialog open={openDisciplinaryDialog} onClose={handleCloseDisciplinaryDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Record Disciplinary Action</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Violation"
                        multiline
                        rows={3}
                        value={disciplinaryData.violation}
                        onChange={(e) => setDisciplinaryData({ ...disciplinaryData, violation: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Action Taken"
                        multiline
                        rows={3}
                        value={disciplinaryData.action_taken}
                        onChange={(e) => setDisciplinaryData({ ...disciplinaryData, action_taken: e.target.value })}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDisciplinaryDialog}>Cancel</Button>
                    <Button onClick={handleDisciplinarySubmit} variant="contained">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error and Success Snackbars */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default FacultyDashboard; 