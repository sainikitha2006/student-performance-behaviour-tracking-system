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
    Button,
    Alert,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tabs,
    Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminDashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [openFacultyDialog, setOpenFacultyDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [studentData, setStudentData] = useState({
        student_id: '',
        name: '',
        dob: '',
        gender: '',
        contact: '',
        address: '',
        program: '',
        year: '',
        department: '',
        parent_name: '',
        parent_contact: '',
        parent_address: ''
    });
    const [facultyData, setFacultyData] = useState({
        faculty_id: '',
        name: '',
        department: '',
        contact: ''
    });

    const fetchData = async () => {
        try {
            const [studentsRes, facultyRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/students'),
                axios.get('http://localhost:5000/api/admin/faculty'),
                axios.get('http://localhost:5000/api/admin/department-stats')
            ]);
            setStudents(studentsRes.data);
            setFaculty(facultyRes.data);
            setDepartmentStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenStudentDialog = (student = null) => {
        if (student) {
            setSelectedStudent(student);
            setStudentData({
                student_id: student.student_id,
                name: student.name,
                dob: student.dob,
                gender: student.gender,
                contact: student.contact,
                address: student.address,
                program: student.program,
                year: student.year,
                department: student.department,
                parent_name: student.parent_name,
                parent_contact: student.parent_contact,
                parent_address: student.parent_address
            });
        } else {
            setSelectedStudent(null);
            setStudentData({
                student_id: '',
                name: '',
                dob: '',
                gender: '',
                contact: '',
                address: '',
                program: '',
                year: '',
                department: '',
                parent_name: '',
                parent_contact: '',
                parent_address: ''
            });
        }
        setOpenStudentDialog(true);
    };

    const handleOpenFacultyDialog = (faculty = null) => {
        if (faculty) {
            setSelectedFaculty(faculty);
            setFacultyData({
                faculty_id: faculty.faculty_id,
                name: faculty.name,
                department: faculty.department,
                contact: faculty.contact
            });
        } else {
            setSelectedFaculty(null);
            setFacultyData({
                faculty_id: '',
                name: '',
                department: '',
                contact: ''
            });
        }
        setOpenFacultyDialog(true);
    };

    const handleCloseStudentDialog = () => {
        setOpenStudentDialog(false);
        setSelectedStudent(null);
        setStudentData({
            student_id: '',
            name: '',
            dob: '',
            gender: '',
            contact: '',
            address: '',
            program: '',
            year: '',
            department: '',
            parent_name: '',
            parent_contact: '',
            parent_address: ''
        });
    };

    const handleCloseFacultyDialog = () => {
        setOpenFacultyDialog(false);
        setSelectedFaculty(null);
        setFacultyData({
            faculty_id: '',
            name: '',
            department: '',
            contact: ''
        });
    };

    const handleStudentSubmit = async () => {
        try {
            // Validate required fields
            if (!studentData.student_id || !studentData.name || !studentData.dob || !studentData.gender || 
                !studentData.contact || !studentData.address || !studentData.program || !studentData.year || 
                !studentData.department || !studentData.parent_name || !studentData.parent_contact || 
                !studentData.parent_address) {
                setError('Please fill in all required fields');
                return;
            }

            // Validate date format
            if (!isValidDate(studentData.dob)) {
                setError('Please enter a valid date of birth');
                return;
            }

            if (selectedStudent) {
                await axios.put(`http://localhost:5000/api/admin/student/${selectedStudent.student_id}`, studentData);
                setSuccess('Student updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/admin/student', studentData);
                setSuccess('Student added successfully');
            }
            handleCloseStudentDialog();
            fetchData();
        } catch (error) {
            console.error('Error saving student:', error);
            setError(error.response?.data?.error || 'Failed to save student. Please try again.');
        }
    };

    const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    const handleFacultySubmit = async () => {
        try {
            if (selectedFaculty) {
                await axios.put(`http://localhost:5000/api/admin/faculty/${selectedFaculty.faculty_id}`, facultyData);
                setSuccess('Faculty updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/admin/faculty', facultyData);
                setSuccess('Faculty added successfully');
            }
            handleCloseFacultyDialog();
            fetchData();
        } catch (error) {
            console.error('Error saving faculty:', error);
            setError(error.response?.data?.error || 'Failed to save faculty. Please try again.');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/student/${studentId}`);
                setSuccess('Student deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting student:', error);
                setError('Failed to delete student. Please try again.');
            }
        }
    };

    const handleDeleteFaculty = async (facultyId) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/faculty/${facultyId}`);
                setSuccess('Faculty deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting faculty:', error);
                setError('Failed to delete faculty. Please try again.');
            }
        }
    };

    return (
        <Container maxWidth="lg">
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

                {/* Department Statistics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {departmentStats.map((stat) => (
                        <Grid item xs={12} sm={6} md={4} key={stat.department}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        {stat.department}
                                    </Typography>
                                    <Typography variant="h5">
                                        {stat.student_count} Students
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {stat.faculty_count} Faculty Members
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Students" />
                        <Tab label="Faculty" />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenStudentDialog()}
                            sx={{ mb: 2 }}
                        >
                            Add New Student
                        </Button>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Program</TableCell>
                                        <TableCell>Year</TableCell>
                                        <TableCell>Department</TableCell>
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
                                            <TableCell>{student.department}</TableCell>
                                            <TableCell>{student.parent_name}</TableCell>
                                            <TableCell>{student.parent_contact}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenStudentDialog(student)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteStudent(student.student_id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
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
                            color="primary"
                            onClick={() => handleOpenFacultyDialog()}
                            sx={{ mb: 2 }}
                        >
                            Add New Faculty
                        </Button>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Faculty ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {faculty.map((faculty) => (
                                        <TableRow key={faculty.faculty_id}>
                                            <TableCell>{faculty.faculty_id}</TableCell>
                                            <TableCell>{faculty.name}</TableCell>
                                            <TableCell>{faculty.department}</TableCell>
                                            <TableCell>{faculty.contact}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenFacultyDialog(faculty)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteFaculty(faculty.faculty_id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>

            {/* Student Dialog */}
            <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedStudent ? 'Edit Student' : 'Add New Student'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Student Information
                            </Typography>
                            <TextField
                                fullWidth
                                label="Student ID"
                                value={studentData.student_id}
                                onChange={(e) => setStudentData({ ...studentData, student_id: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Name"
                                value={studentData.name}
                                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                value={studentData.dob}
                                onChange={(e) => setStudentData({ ...studentData, dob: e.target.value })}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={studentData.gender}
                                    onChange={(e) => setStudentData({ ...studentData, gender: e.target.value })}
                                    label="Gender"
                                    required
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Contact"
                                value={studentData.contact}
                                onChange={(e) => setStudentData({ ...studentData, contact: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                value={studentData.address}
                                onChange={(e) => setStudentData({ ...studentData, address: e.target.value })}
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Academic Information
                            </Typography>
                            <TextField
                                fullWidth
                                label="Program"
                                value={studentData.program}
                                onChange={(e) => setStudentData({ ...studentData, program: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Year"
                                type="number"
                                value={studentData.year}
                                onChange={(e) => setStudentData({ ...studentData, year: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Department"
                                value={studentData.department}
                                onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Parent Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Parent Name"
                                        value={studentData.parent_name}
                                        onChange={(e) => setStudentData({ ...studentData, parent_name: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Parent Contact"
                                        value={studentData.parent_contact}
                                        onChange={(e) => setStudentData({ ...studentData, parent_contact: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Parent Address"
                                        value={studentData.parent_address}
                                        onChange={(e) => setStudentData({ ...studentData, parent_address: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStudentDialog}>Cancel</Button>
                    <Button onClick={handleStudentSubmit} variant="contained">
                        {selectedStudent ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Faculty Dialog */}
            <Dialog open={openFacultyDialog} onClose={handleCloseFacultyDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Faculty ID"
                        value={facultyData.faculty_id}
                        onChange={(e) => setFacultyData({ ...facultyData, faculty_id: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Name"
                        value={facultyData.name}
                        onChange={(e) => setFacultyData({ ...facultyData, name: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Department"
                        value={facultyData.department}
                        onChange={(e) => setFacultyData({ ...facultyData, department: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Contact"
                        value={facultyData.contact}
                        onChange={(e) => setFacultyData({ ...facultyData, contact: e.target.value })}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFacultyDialog}>Cancel</Button>
                    <Button onClick={handleFacultySubmit} variant="contained">
                        {selectedFaculty ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard; 