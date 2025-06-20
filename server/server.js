const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/login', async (req, res) => {
    const { id, role } = req.body;
    
    try {
        // Validate input
        if (!id || !role) {
            return res.status(400).json({ error: 'ID and role are required' });
        }

        let table, idField;
        switch(role) {
            case 'student':
                table = 'STUDENT';
                idField = 'student_id';
                break;
            case 'faculty':
                table = 'FACULTY';
                idField = 'faculty_id';
                break;
            case 'parent':
                table = 'PARENT';
                idField = 'parent_id';
                break;
            case 'admin':
                if (id === 'admin') {
                    return res.json({ role: 'admin', name: 'Admin' });
                }
                return res.status(401).json({ error: 'Invalid credentials' });
            default:
                return res.status(400).json({ error: 'Invalid role' });
        }

        console.log(`Attempting to find ${role} with ${idField}: ${id}`);
        const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [id]);
        
        if (rows.length > 0) {
            console.log(`Found ${role}:`, rows[0]);
            const userData = {
                id: rows[0][idField],
                name: rows[0].name,
                role
            };
            
            // Add department for faculty
            if (role === 'faculty') {
                userData.department = rows[0].department;
            }
            
            res.json(userData);
        } else {
            console.log(`No ${role} found with ${idField}: ${id}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

// Student routes
app.get('/api/student/:id/activities', async (req, res) => {
    try {
        const [activities] = await pool.query('CALL get_student_activities(?)', [req.params.id]);
        res.json(activities[0]);
    } catch (error) {
        console.error('Error fetching student activities:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/student/:id/behavior', async (req, res) => {
    try {
        const [records] = await pool.query('CALL get_student_behavior_history(?)', [req.params.id]);
        res.json(records[0]);
    } catch (error) {
        console.error('Error fetching student behavior:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/student/:id/disciplinary', async (req, res) => {
    try {
        const [actions] = await pool.query('CALL get_student_disciplinary_actions(?)', [req.params.id]);
        res.json(actions[0]);
    } catch (error) {
        console.error('Error fetching disciplinary actions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/student/:id/stats', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                calculate_student_age(?) as age,
                get_student_activity_count(?) as activity_count,
                is_graduation_eligible(?) as graduation_eligible,
                get_behavior_score(?) as behaviour_score,
                get_department_student_count(?) as department_student_count,
                get_disciplinary_action_count(?) as disciplinary_action_count,
                get_average_behavior_rating(?) as average_behaviour_rating
        `, [req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id]);
        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Faculty routes
app.get('/api/faculty/:id/students', async (req, res) => {
    try {
        // First get the faculty's department
        const [faculty] = await pool.query('SELECT department FROM FACULTY WHERE faculty_id = ?', [req.params.id]);
        
        if (faculty.length === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Then get students from the same department
        const [students] = await pool.query(`
            SELECT s.*, p.name as parent_name, p.contact as parent_contact
            FROM STUDENT s
            LEFT JOIN PARENT p ON s.student_id = p.student_id
            WHERE s.department = ?
        `, [faculty[0].department]);
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching faculty students:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/faculty/behavior', async (req, res) => {
    try {
        const { student_id, behavior_type, remarks, faculty_id } = req.body;
        
        // First verify that the student belongs to the faculty's department
        const [faculty] = await pool.query('SELECT department FROM FACULTY WHERE faculty_id = ?', [faculty_id]);
        const [student] = await pool.query('SELECT department FROM STUDENT WHERE student_id = ?', [student_id]);
        
        if (faculty.length === 0 || student.length === 0) {
            return res.status(404).json({ error: 'Faculty or student not found' });
        }
        
        if (faculty[0].department !== student[0].department) {
            return res.status(403).json({ error: 'You can only add behavior records for students in your department' });
        }

        await pool.query('CALL update_behavior_record(?, ?, ?)', [student_id, behavior_type, remarks]);
        res.json({ message: 'Behavior record added successfully' });
    } catch (error) {
        console.error('Error adding behavior record:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/faculty/disciplinary', async (req, res) => {
    try {
        const { student_id, violation, action_taken, faculty_id } = req.body;
        console.log('Received disciplinary data:', { student_id, violation, action_taken, faculty_id });
        
        // First verify that the student belongs to the faculty's department
        const [faculty] = await pool.query('SELECT department FROM FACULTY WHERE faculty_id = ?', [faculty_id]);
        console.log('Faculty query result:', faculty);
        
        const [student] = await pool.query('SELECT department FROM STUDENT WHERE student_id = ?', [student_id]);
        console.log('Student query result:', student);
        
        if (faculty.length === 0 || student.length === 0) {
            return res.status(404).json({ error: 'Faculty or student not found' });
        }
        
        if (faculty[0].department !== student[0].department) {
            return res.status(403).json({ error: 'You can only add disciplinary actions for students in your department' });
        }

        await pool.query('CALL assign_disciplinary_action(?, ?, ?, ?)', [student_id, violation, action_taken, faculty_id]);
        res.json({ message: 'Disciplinary action recorded successfully' });
    } catch (error) {
        console.error('Error adding disciplinary action:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/faculty/department/:department/stats', async (req, res) => {
    try {
        const [stats] = await pool.query('CALL get_department_stats(?)', [req.params.department]);
        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Parent routes
app.get('/api/parent/:id/student', async (req, res) => {
    try {
        const [student] = await pool.query(`
            SELECT s.* 
            FROM STUDENT s
            JOIN PARENT p ON s.student_id = p.student_id
            WHERE p.parent_id = ?
        `, [req.params.id]);
        
        if (student.length === 0) {
            return res.status(404).json({ error: 'No student found for this parent' });
        }
        
        res.json(student[0]);
    } catch (error) {
        console.error('Error fetching parent student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/students', async (req, res) => {
    try {
        const [students] = await pool.query(`
            SELECT s.*, p.name as parent_name, p.contact as parent_contact, p.address as parent_address
            FROM STUDENT s
            LEFT JOIN PARENT p ON s.student_id = p.student_id
        `);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/faculty', async (req, res) => {
    try {
        const [faculty] = await pool.query('SELECT * FROM FACULTY');
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/student', async (req, res) => {
    try {
        const { student_id, name, dob, gender, contact, address, program, year, department, parent_name, parent_contact, parent_address } = req.body;
        
        // Validate required fields
        if (!student_id || !name || !dob || !gender || !contact || !address || !program || !year || !department || !parent_name || !parent_contact || !parent_address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Format date to YYYY-MM-DD
        const formattedDate = new Date(dob).toISOString().split('T')[0];
        
        await pool.query('CALL add_student_with_parent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            student_id, name, formattedDate, gender, contact, address,
            program, year, department, parent_name, parent_contact, parent_address
        ]);
        
        res.json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/student/:id', async (req, res) => {
    try {
        const { name, dob, gender, contact, address, program, year, department, parent_name, parent_contact, parent_address } = req.body;
        
        // Update student
        await pool.query(`
            UPDATE STUDENT 
            SET name = ?, dob = ?, gender = ?, contact = ?, address = ?,
                program = ?, year = ?, department = ?
            WHERE student_id = ?
        `, [name, dob, gender, contact, address, program, year, department, req.params.id]);
        
        // Update parent
        await pool.query(`
            UPDATE PARENT 
            SET name = ?, contact = ?, address = ?
            WHERE student_id = ?
        `, [parent_name, parent_contact, parent_address, req.params.id]);
        
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/student/:id', async (req, res) => {
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        try {
            // Delete from STUDENT_ACTIVITY first
            await pool.query('DELETE FROM STUDENT_ACTIVITY WHERE student_id = ?', [req.params.id]);
            
            // Delete from BEHAVIOUR_RECORD
            await pool.query('DELETE FROM BEHAVIOUR_RECORD WHERE student_id = ?', [req.params.id]);
            
            // Delete from DISCIPLINARY_ACTION
            await pool.query('DELETE FROM DISCIPLINARY_ACTION WHERE student_id = ?', [req.params.id]);
            
            // Delete from PARENT
            await pool.query('DELETE FROM PARENT WHERE student_id = ?', [req.params.id]);
            
            // Finally delete from STUDENT
            await pool.query('DELETE FROM STUDENT WHERE student_id = ?', [req.params.id]);

            // If all deletions are successful, commit the transaction
            await pool.query('COMMIT');
            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            // If any error occurs, rollback the transaction
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/faculty', async (req, res) => {
    try {
        const { faculty_id, name, department, contact } = req.body;
        await pool.query(`
            INSERT INTO FACULTY (faculty_id, name, department, contact)
            VALUES (?, ?, ?, ?)
        `, [faculty_id, name, department, contact]);
        res.json({ message: 'Faculty added successfully' });
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/faculty/:id', async (req, res) => {
    try {
        const { name, department, contact } = req.body;
        await pool.query(`
            UPDATE FACULTY 
            SET name = ?, department = ?, contact = ?
            WHERE faculty_id = ?
        `, [name, department, contact, req.params.id]);
        res.json({ message: 'Faculty updated successfully' });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/faculty/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FACULTY WHERE faculty_id = ?', [req.params.id]);
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Activity routes
app.post('/api/activity', async (req, res) => {
    try {
        const { activity_id, name, type, date, description } = req.body;
        await pool.query(`
            INSERT INTO ACTIVITY (activity_id, name, type, date, description)
            VALUES (?, ?, ?, ?, ?)
        `, [activity_id, name, type, date, description]);
        res.json({ message: 'Activity created successfully' });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/activity/enroll', async (req, res) => {
    try {
        const { student_id, activity_id } = req.body;
        await pool.query('CALL register_student_activity(?, ?)', [student_id, activity_id]);
        res.json({ message: 'Student enrolled in activity successfully' });
    } catch (error) {
        console.error('Error enrolling student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/activity/:id/participants', async (req, res) => {
    try {
        const [participants] = await pool.query(`
            SELECT s.*
            FROM STUDENT s
            JOIN STUDENT_ACTIVITY sa ON s.student_id = sa.student_id
            WHERE sa.activity_id = ?
        `, [req.params.id]);
        res.json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all activities route
app.get('/api/activities', async (req, res) => {
    try {
        const [activities] = await pool.query('SELECT * FROM ACTIVITY');
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all students route
app.get('/api/students', async (req, res) => {
    try {
        const [students] = await pool.query('SELECT * FROM STUDENT');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/department-stats', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                s.department,
                COUNT(DISTINCT s.student_id) as student_count,
                COUNT(DISTINCT f.faculty_id) as faculty_count
            FROM STUDENT s
            LEFT JOIN FACULTY f ON s.department = f.department
            GROUP BY s.department
        `);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.close();
        app.listen(PORT + 1, () => {
            console.log(`Server running on port ${PORT + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
});