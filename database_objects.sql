-- Procedures

-- 1. Procedure to add a new student with parent information
DELIMITER //
CREATE PROCEDURE add_student_with_parent(
    IN p_student_id INT,
    IN p_name VARCHAR(20),
    IN p_dob DATE,
    IN p_gender ENUM('Male','Female','Other'),
    IN p_contact VARCHAR(15),
    IN p_address TEXT,
    IN p_program VARCHAR(20),
    IN p_year INT,
    IN p_department VARCHAR(50),
    IN p_parent_name VARCHAR(20),
    IN p_parent_contact VARCHAR(15),
    IN p_parent_address TEXT
)
BEGIN
    INSERT INTO STUDENT (student_id, name, dob, gender, contact, address, program, year, department)
    VALUES (p_student_id, p_name, p_dob, p_gender, p_contact, p_address, p_program, p_year, p_department);
    
    INSERT INTO PARENT (parent_id, student_id, name, contact, address)
    VALUES (p_student_id, p_student_id, p_parent_name, p_parent_contact, p_parent_address);
END //
DELIMITER ;

-- 2. Procedure to update student behavior record
DELIMITER //
CREATE PROCEDURE update_behavior_record(
    IN p_student_id INT,
    IN p_behavior_type VARCHAR(30),
    IN p_remarks TEXT
)
BEGIN
    DECLARE new_record_id INT;
    
    -- Get the next record ID
    SELECT COALESCE(MAX(record_id), 0) + 1 INTO new_record_id FROM BEHAVIOUR_RECORD;
    
    -- Insert the new record
    INSERT INTO BEHAVIOUR_RECORD (record_id, student_id, date, behaviour_type, remarks)
    VALUES (new_record_id, p_student_id, CURDATE(), p_behavior_type, p_remarks);
END //
DELIMITER ;

-- 3. Procedure to assign disciplinary action
DELIMITER //
CREATE PROCEDURE assign_disciplinary_action(
    IN p_student_id INT,
    IN p_violation TEXT,
    IN p_action_taken TEXT,
    IN p_faculty_id INT
)
BEGIN
    DECLARE new_action_id INT;
    
    -- Get the next action ID
    SELECT COALESCE(MAX(action_id), 0) + 1 INTO new_action_id FROM DISCIPLINARY_ACTION;
    
    -- Insert the new disciplinary action
    INSERT INTO DISCIPLINARY_ACTION (action_id, student_id, date, violation, action_taken, faculty_id)
    VALUES (new_action_id, p_student_id, CURDATE(), p_violation, p_action_taken, p_faculty_id);
END //
DELIMITER ;

-- 4. Procedure to register student for activity
DELIMITER //
CREATE PROCEDURE register_student_activity(
    IN p_student_id INT,
    IN p_activity_id INT
)
BEGIN
    INSERT INTO STUDENT_ACTIVITY (student_id, activity_id)
    VALUES (p_student_id, p_activity_id);
END //
DELIMITER ;

-- 5. Procedure to get student details with parent information
DELIMITER //
CREATE PROCEDURE get_student_details(IN p_student_id INT)
BEGIN
    SELECT s.*, p.name as parent_name, p.contact as parent_contact
    FROM STUDENT s
    JOIN PARENT p ON s.student_id = p.student_id
    WHERE s.student_id = p_student_id;
END //
DELIMITER ;

-- 6. Procedure to get student behavior history
DELIMITER //
CREATE PROCEDURE get_student_behavior_history(IN p_student_id INT)
BEGIN
    SELECT * FROM BEHAVIOUR_RECORD
    WHERE student_id = p_student_id
    ORDER BY date DESC;
END //
DELIMITER ;

-- 7. Procedure to get student disciplinary actions
DELIMITER //
CREATE PROCEDURE get_student_disciplinary_actions(IN p_student_id INT)
BEGIN
    SELECT da.*, f.name as faculty_name
    FROM DISCIPLINARY_ACTION da
    JOIN FACULTY f ON da.faculty_id = f.faculty_id
    WHERE da.student_id = p_student_id
    ORDER BY da.date DESC;
END //
DELIMITER ;

-- 8. Procedure to get student activities
DELIMITER //
CREATE PROCEDURE get_student_activities(IN p_student_id INT)
BEGIN
    SELECT a.*
    FROM ACTIVITY a
    JOIN STUDENT_ACTIVITY sa ON a.activity_id = sa.activity_id
    WHERE sa.student_id = p_student_id;
END //
DELIMITER ;

-- 9. Procedure to update student contact information
DELIMITER //
CREATE PROCEDURE update_student_contact(
    IN p_student_id INT,
    IN p_new_contact VARCHAR(15),
    IN p_new_address TEXT
)
BEGIN
    UPDATE STUDENT
    SET contact = p_new_contact,
        address = p_new_address
    WHERE student_id = p_student_id;
END //
DELIMITER ;

-- 10. Procedure to get department statistics
DELIMITER //
CREATE PROCEDURE get_department_stats(IN p_department VARCHAR(20))
BEGIN
    SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_students,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_students,
        AVG(year) as average_year
    FROM STUDENT
    WHERE department = p_department;
END //
DELIMITER ;

-- Functions

-- 1. Function to calculate student age
DELIMITER //
CREATE FUNCTION calculate_student_age(p_student_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE student_dob DATE;
    SELECT dob INTO student_dob FROM STUDENT WHERE student_id = p_student_id;
    RETURN TIMESTAMPDIFF(YEAR, student_dob, CURDATE());
END //
DELIMITER ;

-- 2. Function to check if student has disciplinary actions
DELIMITER //
CREATE FUNCTION has_disciplinary_actions(p_student_id INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE action_count INT;
    SELECT COUNT(*) INTO action_count FROM DISCIPLINARY_ACTION WHERE student_id = p_student_id;
    RETURN action_count > 0;
END //
DELIMITER ;

-- 3. Function to get student's activity count
DELIMITER //
CREATE FUNCTION get_student_activity_count(p_student_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE activity_count INT;
    SELECT COUNT(*) INTO activity_count FROM STUDENT_ACTIVITY WHERE student_id = p_student_id;
    RETURN activity_count;
END //
DELIMITER ;

-- 4. Function to check if student is eligible for graduation
DELIMITER //
CREATE FUNCTION is_graduation_eligible(p_student_id INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE student_year INT;
    SELECT year INTO student_year FROM STUDENT WHERE student_id = p_student_id;
    RETURN student_year >= 4;
END //
DELIMITER ;

-- 5. Function to get student's behavior score
DELIMITER //
CREATE FUNCTION get_behavior_score(p_student_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE good_count INT;
    DECLARE bad_count INT;
    
    SELECT COUNT(*) INTO good_count 
    FROM BEHAVIOUR_RECORD 
    WHERE student_id = p_student_id 
    AND behaviour_type IN ('Good Conduct', 'Excellent Performance', 'Sports Achievement', 'Community Service');
    
    SELECT COUNT(*) INTO bad_count 
    FROM BEHAVIOUR_RECORD 
    WHERE student_id = p_student_id 
    AND behaviour_type IN ('Late Submission', 'Attendance Issue', 'Disruptive Behavior', 'Plagiarism Issue');
    
    RETURN good_count - bad_count;
END //
DELIMITER ;

-- 6. Function to get department student count
DELIMITER //
CREATE FUNCTION get_department_student_count(p_department VARCHAR(20)) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE student_count INT;
    SELECT COUNT(*) INTO student_count FROM STUDENT WHERE department = p_department;
    RETURN student_count;
END //
DELIMITER ;

-- 7. Function to check if activity is full
DELIMITER //
CREATE FUNCTION is_activity_full(p_activity_id INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE participant_count INT;
    SELECT COUNT(*) INTO participant_count FROM STUDENT_ACTIVITY WHERE activity_id = p_activity_id;
    RETURN participant_count >= 10; -- Assuming max 10 participants per activity
END //
DELIMITER ;

-- 8. Function to get student's disciplinary action count
DELIMITER //
CREATE FUNCTION get_disciplinary_action_count(p_student_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE action_count INT;
    SELECT COUNT(*) INTO action_count FROM DISCIPLINARY_ACTION WHERE student_id = p_student_id;
    RETURN action_count;
END //
DELIMITER ;

-- 9. Function to get student's average behavior rating
DELIMITER //
CREATE FUNCTION get_average_behavior_rating(p_student_id INT) RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    DECLARE rating DECIMAL(3,2);
    SELECT AVG(CASE 
        WHEN behaviour_type IN ('Good Conduct', 'Excellent Performance') THEN 5
        WHEN behaviour_type IN ('Sports Achievement', 'Community Service') THEN 4
        WHEN behaviour_type IN ('Late Submission', 'Attendance Issue') THEN 2
        WHEN behaviour_type IN ('Disruptive Behavior', 'Plagiarism Issue') THEN 1
        ELSE 3
    END) INTO rating
    FROM BEHAVIOUR_RECORD
    WHERE student_id = p_student_id;
    
    RETURN COALESCE(rating, 3.00);
END //
DELIMITER ;

-- 10. Function to check if student is active in activities
DELIMITER //
CREATE FUNCTION is_student_active(p_student_id INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE activity_count INT;
    SELECT COUNT(*) INTO activity_count 
    FROM STUDENT_ACTIVITY sa
    JOIN ACTIVITY a ON sa.activity_id = a.activity_id
    WHERE sa.student_id = p_student_id
    AND a.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
    
    RETURN activity_count > 0;
END //
DELIMITER ;

-- Triggers

-- 1. Trigger to prevent duplicate student IDs
DELIMITER //
CREATE TRIGGER before_student_insert
BEFORE INSERT ON STUDENT
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM STUDENT WHERE student_id = NEW.student_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student ID already exists';
    END IF;
END //
DELIMITER ;

-- 2. Trigger to update parent contact when student contact is updated
DELIMITER //
CREATE TRIGGER after_student_contact_update
AFTER UPDATE ON STUDENT
FOR EACH ROW
BEGIN
    IF NEW.contact != OLD.contact OR NEW.address != OLD.address THEN
        UPDATE PARENT
        SET contact = NEW.contact,
            address = NEW.address
        WHERE student_id = NEW.student_id;
    END IF;
END //
DELIMITER ;

-- 3. Trigger to prevent invalid behavior record dates
DELIMITER //
CREATE TRIGGER before_behavior_record_insert
BEFORE INSERT ON BEHAVIOUR_RECORD
FOR EACH ROW
BEGIN
    IF NEW.date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Behavior record date cannot be in the future';
    END IF;
END //
DELIMITER ;

-- 4. Trigger to log disciplinary actions
DELIMITER //
CREATE TRIGGER after_disciplinary_insert
AFTER INSERT ON DISCIPLINARY_ACTION
FOR EACH ROW
BEGIN
    DECLARE new_record_id INT;
    
    -- Get the next record ID
    SELECT COALESCE(MAX(record_id), 0) + 1 INTO new_record_id FROM BEHAVIOUR_RECORD;
    
    -- Insert the behavior record
    INSERT INTO BEHAVIOUR_RECORD (record_id, student_id, date, behaviour_type, remarks)
    VALUES (new_record_id, NEW.student_id, NEW.date, 'Disciplinary Action',
            CONCAT('Violation: ', NEW.violation, '. Action: ', NEW.action_taken));
END //
DELIMITER ;

-- 5. Trigger to prevent faculty from assigning disciplinary actions to their own department
DELIMITER //
CREATE TRIGGER before_disciplinary_insert
BEFORE INSERT ON DISCIPLINARY_ACTION
FOR EACH ROW
BEGIN
    DECLARE faculty_dept VARCHAR(50);
    DECLARE student_dept VARCHAR(50);
    
    SELECT department INTO faculty_dept FROM FACULTY WHERE faculty_id = NEW.faculty_id;
    SELECT department INTO student_dept FROM STUDENT WHERE student_id = NEW.student_id;
    
    IF faculty_dept != student_dept THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Faculty can only assign disciplinary actions to students in their own department';
    END IF;
END //
DELIMITER ;

-- 6. Trigger to prevent activity registration for suspended students
DELIMITER //
CREATE TRIGGER before_student_activity_insert
BEFORE INSERT ON STUDENT_ACTIVITY
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM DISCIPLINARY_ACTION 
        WHERE student_id = NEW.student_id 
        AND action_taken LIKE '%suspension%'
        AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student is currently suspended and cannot register for activities';
    END IF;
END //
DELIMITER ;

-- 7. Trigger to update student year on January 1st
DELIMITER //
CREATE TRIGGER update_student_year
BEFORE UPDATE ON STUDENT
FOR EACH ROW
BEGIN
    IF MONTH(CURDATE()) = 1 AND DAY(CURDATE()) = 1 AND NEW.year < 4 THEN
        SET NEW.year = NEW.year + 1;
    END IF;
END //
DELIMITER ;

-- 8. Trigger to prevent deletion of faculty with active disciplinary actions
DELIMITER //
CREATE TRIGGER before_faculty_delete
BEFORE DELETE ON FACULTY
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM DISCIPLINARY_ACTION WHERE faculty_id = OLD.faculty_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete faculty with active disciplinary actions';
    END IF;
END //
DELIMITER ;

-- 9. Trigger to prevent past activity registration
DELIMITER //
CREATE TRIGGER before_activity_insert
BEFORE INSERT ON ACTIVITY
FOR EACH ROW
BEGIN
    IF NEW.date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot create activity with past date';
    END IF;
END //
DELIMITER ;

-- 10. Trigger to maintain student activity count
DELIMITER //
CREATE TRIGGER after_student_activity_change
AFTER INSERT OR DELETE ON STUDENT_ACTIVITY
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE STUDENT
        SET activity_count = COALESCE(activity_count, 0) + 1
        WHERE student_id = NEW.student_id;
    ELSE
        UPDATE STUDENT
        SET activity_count = COALESCE(activity_count, 0) - 1
        WHERE student_id = OLD.student_id;
    END IF;
END //
DELIMITER ;

-- Create ACTIVITY table
CREATE TABLE IF NOT EXISTS ACTIVITY (
    activity_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    faculty_id INT,
    FOREIGN KEY (faculty_id) REFERENCES FACULTY(faculty_id)
);

-- Create STUDENT_ACTIVITY table
CREATE TABLE IF NOT EXISTS STUDENT_ACTIVITY (
    student_id INT,
    activity_id INT,
    status VARCHAR(20) DEFAULT 'Enrolled',
    PRIMARY KEY (student_id, activity_id),
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id),
    FOREIGN KEY (activity_id) REFERENCES ACTIVITY(activity_id)
);

-- Procedure to create new activity
DELIMITER //
CREATE PROCEDURE create_activity(
    IN p_activity_id INT,
    IN p_name VARCHAR(100),
    IN p_type VARCHAR(50),
    IN p_date DATE,
    IN p_description TEXT,
    IN p_faculty_id INT
)
BEGIN
    INSERT INTO ACTIVITY (activity_id, name, type, date, description, faculty_id)
    VALUES (p_activity_id, p_name, p_type, p_date, p_description, p_faculty_id);
END //
DELIMITER ;

-- Procedure to enroll student in activity
DELIMITER //
CREATE PROCEDURE enroll_student_in_activity(
    IN p_student_id INT,
    IN p_activity_id INT
)
BEGIN
    INSERT INTO STUDENT_ACTIVITY (student_id, activity_id)
    VALUES (p_student_id, p_activity_id);
END //
DELIMITER ;

-- Procedure to get student's activities
DELIMITER //
CREATE PROCEDURE get_student_activities(IN p_student_id INT)
BEGIN
    SELECT a.*, f.name as faculty_name 
    FROM ACTIVITY a
    JOIN STUDENT_ACTIVITY sa ON a.activity_id = sa.activity_id
    LEFT JOIN FACULTY f ON a.faculty_id = f.faculty_id
    WHERE sa.student_id = p_student_id;
END //
DELIMITER ;

-- Procedure to get faculty's activities
DELIMITER //
CREATE PROCEDURE get_faculty_activities(IN p_faculty_id INT)
BEGIN
    SELECT a.*, COUNT(sa.student_id) as enrolled_students
    FROM ACTIVITY a
    LEFT JOIN STUDENT_ACTIVITY sa ON a.activity_id = sa.activity_id
    WHERE a.faculty_id = p_faculty_id
    GROUP BY a.activity_id;
END //
DELIMITER ;

-- Procedure to get activity participants
DELIMITER //
CREATE PROCEDURE get_activity_participants(IN p_activity_id INT)
BEGIN
    SELECT s.*, sa.status
    FROM STUDENT s
    JOIN STUDENT_ACTIVITY sa ON s.student_id = sa.student_id
    WHERE sa.activity_id = p_activity_id;
END //
DELIMITER ;

-- Alter STUDENT table to increase department column length
ALTER TABLE STUDENT MODIFY COLUMN department VARCHAR(50); 