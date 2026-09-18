// 50+ Comprehensive SQL Practice Questions Dataset with Clean Starter Templates

export const SQL_CHALLENGES = [
  // ─── MODULE 1: DDL & DATABASE SCHEMAS ──────────────────────────────────────
  {
    id: 'sql_1',
    title: 'Create Courses Table with Constraints',
    category: 'SQL',
    difficulty: 'Easy',
    points: 40,
    tags: ['DDL', 'CREATE TABLE', 'Primary Key', 'Constraints'],
    desc: 'Write an SQL statement to create a table named `Courses` with columns: `course_id` (INT, Primary Key, Auto Increment), `title` (VARCHAR 150, Not Null), `price` (DECIMAL 10,2, Default 0.00), and `created_at` (TIMESTAMP, Default Current Timestamp).',
    examples: [
      { input: 'Execute DDL CREATE TABLE command', output: 'Table Courses created successfully.', explanation: 'Table defined with appropriate data types and constraints.' }
    ],
    constraints: ['course_id must be AUTO_INCREMENT PRIMARY KEY.', 'title cannot be NULL.'],
    hints: ['Use `CREATE TABLE Courses (...)` syntax with `PRIMARY KEY` and `DEFAULT`.'],
    solutionKeywords: ['CREATE', 'TABLE', 'Courses', 'course_id', 'PRIMARY', 'KEY', 'title'],
    starters: {
      sql: `-- Write your SQL query to create Courses table below\n`,
      java: `// Write your Java DDL statement here\nString sql = "";`,
      cpp: `// Write your C++ DDL query string here\nstring query = "";`,
      python: `# Write your Python SQL query here\nsql = """"""`,
      javascript: `// Write your JavaScript SQL query here\nconst sql = "";`
    },
    testCases: [
      { input: 'DDL CREATE TABLE Courses Schema', expected: 'Table Created (4 columns, 1 Primary Key)' }
    ],
    tableOutput: {
      columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
      rows: [
        ['course_id', 'int(11)', 'NO', 'PRI', 'NULL', 'auto_increment'],
        ['title', 'varchar(150)', 'NO', '', 'NULL', ''],
        ['price', 'decimal(10,2)', 'YES', '', '0.00', ''],
        ['created_at', 'timestamp', 'YES', '', 'CURRENT_TIMESTAMP', '']
      ]
    }
  },
  {
    id: 'sql_2',
    title: 'Add Foreign Key Constraint to Students Table',
    category: 'SQL',
    difficulty: 'Easy',
    points: 45,
    tags: ['DDL', 'ALTER TABLE', 'Foreign Key'],
    desc: 'Write an SQL query to alter the existing `Enrollments` table and add a foreign key constraint named `fk_student_id` referencing `id` of `Students` table on column `student_id`.',
    examples: [
      { input: 'ALTER TABLE Enrollments ADD CONSTRAINT...', output: 'Foreign key added successfully.', explanation: 'Enforces referential integrity.' }
    ],
    constraints: ['Constraint name must be fk_student_id.'],
    hints: ['Use `ALTER TABLE Enrollments ADD CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES Students(id);`'],
    solutionKeywords: ['ALTER', 'TABLE', 'Enrollments', 'ADD', 'CONSTRAINT', 'FOREIGN', 'KEY', 'REFERENCES', 'Students'],
    starters: {
      sql: `-- Write your ALTER TABLE query to add foreign key below\n`,
      java: `String alterQuery = "";`,
      cpp: `string sql = "";`,
      python: `query = ""`,
      javascript: `const query = "";`
    },
    testCases: [
      { input: 'ALTER TABLE Enrollments ADD FOREIGN KEY', expected: 'Constraint fk_student_id Added' }
    ],
    tableOutput: {
      columns: ['Constraint Name', 'Table', 'Column', 'Ref Table', 'Ref Column'],
      rows: [
        ['fk_student_id', 'Enrollments', 'student_id', 'Students', 'id']
      ]
    }
  },
  {
    id: 'sql_3',
    title: 'Alter Table Add Column with Default Value',
    category: 'SQL',
    difficulty: 'Easy',
    points: 40,
    tags: ['DDL', 'ALTER TABLE', 'DEFAULT'],
    desc: 'Write an SQL statement to add a new column `status` of type `VARCHAR(20)` with default value `"ACTIVE"` to the `Users` table.',
    examples: [
      { input: 'ALTER TABLE Users ADD COLUMN status VARCHAR(20) DEFAULT "ACTIVE"', output: 'Column status added.', explanation: 'Adds status column with default ACTIVE.' }
    ],
    constraints: ['Default value must be ACTIVE.'],
    hints: ['Syntax: `ALTER TABLE Users ADD status VARCHAR(20) DEFAULT "ACTIVE";`'],
    solutionKeywords: ['ALTER', 'TABLE', 'Users', 'ADD', 'status', 'DEFAULT'],
    starters: {
      sql: `-- Write your ALTER TABLE statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'ALTER TABLE Users ADD COLUMN status', expected: 'Column status Added (Default ACTIVE)' }
    ],
    tableOutput: {
      columns: ['Field', 'Type', 'Default'],
      rows: [['status', 'varchar(20)', 'ACTIVE']]
    }
  },
  {
    id: 'sql_4',
    title: 'Create Table with CHECK Constraint',
    category: 'SQL',
    difficulty: 'Easy',
    points: 45,
    tags: ['DDL', 'CHECK Constraint', 'Validation'],
    desc: 'Write an SQL query to create a table `Accounts` with columns `account_id` (INT Primary Key), `balance` (DECIMAL 12,2), ensuring `balance >= 0` using a `CHECK` constraint.',
    examples: [
      { input: 'CREATE TABLE Accounts (...)', output: 'Table Created with CHECK(balance >= 0)', explanation: 'Prevents negative balances.' }
    ],
    constraints: ['CHECK constraint must enforce balance >= 0.'],
    hints: ['Use `CHECK (balance >= 0)` in table definition.'],
    solutionKeywords: ['CREATE', 'TABLE', 'Accounts', 'CHECK', 'balance'],
    starters: {
      sql: `-- Write your CREATE TABLE Accounts query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'CREATE TABLE Accounts CHECK (balance >= 0)', expected: 'Table Accounts created with CHECK constraint' }
    ],
    tableOutput: {
      columns: ['Constraint', 'Type', 'Condition'],
      rows: [['chk_positive_balance', 'CHECK', 'balance >= 0']]
    }
  },
  {
    id: 'sql_5',
    title: 'Truncate vs Drop Table Schema',
    category: 'SQL',
    difficulty: 'Easy',
    points: 35,
    tags: ['DDL', 'TRUNCATE', 'DROP'],
    desc: 'Write an SQL statement to empty all rows from the `AuditLogs` table while keeping the table structure intact for future inserts.',
    examples: [
      { input: 'TRUNCATE TABLE AuditLogs', output: '0 rows in set.', explanation: 'TRUNCATE resets table data without dropping structure.' }
    ],
    constraints: ['Do not drop the table structure.'],
    hints: ['Use `TRUNCATE TABLE AuditLogs;` instead of `DROP TABLE`.'],
    solutionKeywords: ['TRUNCATE', 'TABLE', 'AuditLogs'],
    starters: {
      sql: `-- Write your TRUNCATE statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'TRUNCATE TABLE AuditLogs', expected: 'AuditLogs truncated (0 rows remain, structure intact)' }
    ],
    tableOutput: {
      columns: ['Table Name', 'Rows Remaining', 'Status'],
      rows: [['AuditLogs', '0', 'Structure Preserved']]
    }
  },
  {
    id: 'sql_6',
    title: 'Create Composite Primary Key Table',
    category: 'SQL',
    difficulty: 'Medium',
    points: 60,
    tags: ['DDL', 'Composite Key', 'Primary Key'],
    desc: 'Write an SQL statement to create a table `StudentCourses` with columns `student_id` (INT) and `course_id` (INT) forming a composite primary key `(student_id, course_id)`.',
    examples: [
      { input: 'CREATE TABLE StudentCourses (...)', output: 'Composite PK created.', explanation: 'Ensures a student cannot enroll in the same course twice.' }
    ],
    constraints: ['PRIMARY KEY must be (student_id, course_id).'],
    hints: ['Specify `PRIMARY KEY (student_id, course_id)` at the end of column definitions.'],
    solutionKeywords: ['CREATE', 'TABLE', 'StudentCourses', 'PRIMARY', 'KEY', 'student_id', 'course_id'],
    starters: {
      sql: `-- Write your CREATE TABLE StudentCourses statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'CREATE TABLE StudentCourses PRIMARY KEY (student_id, course_id)', expected: 'Composite Primary Key (student_id, course_id) created' }
    ],
    tableOutput: {
      columns: ['Key Name', 'Column 1', 'Column 2'],
      rows: [['PRIMARY', 'student_id', 'course_id']]
    }
  },

  // ─── MODULE 2: DML & DATA MODIFICATION ─────────────────────────────────────
  {
    id: 'sql_7',
    title: 'Insert Multiple Rows into Employees Table',
    category: 'SQL',
    difficulty: 'Easy',
    points: 40,
    tags: ['DML', 'INSERT INTO', 'Multi-Row'],
    desc: 'Write an SQL statement to insert 3 new employees into `Employees` (name, department, salary): ("Aarav Patel", "Engineering", 85000), ("Priya Sharma", "Marketing", 62000), ("Rohan Verma", "Finance", 73000).',
    examples: [
      { input: 'INSERT INTO Employees (name, department, salary) VALUES ...', output: '3 rows inserted.', explanation: 'Batch insert execution.' }
    ],
    constraints: ['Insert all 3 records in a single query.'],
    hints: ['Use `INSERT INTO Employees (name, department, salary) VALUES (...), (...), (...);`'],
    solutionKeywords: ['INSERT', 'INTO', 'Employees', 'VALUES', 'Aarav Patel', 'Priya Sharma', 'Rohan Verma'],
    starters: {
      sql: `-- Write your multi-row INSERT INTO statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'INSERT 3 Employee Records', expected: '3 Rows Affected' }
    ],
    tableOutput: {
      columns: ['id', 'name', 'department', 'salary'],
      rows: [
        ['1', 'Aarav Patel', 'Engineering', '85000.00'],
        ['2', 'Priya Sharma', 'Marketing', '62000.00'],
        ['3', 'Rohan Verma', 'Finance', '73000.00']
      ]
    }
  },
  {
    id: 'sql_8',
    title: 'Update Student Status Based on Marks Condition',
    category: 'SQL',
    difficulty: 'Easy',
    points: 45,
    tags: ['DML', 'UPDATE', 'WHERE'],
    desc: 'Write an SQL statement to update the `status` column to `"PASSED"` in the `Students` table for all students whose `marks` are greater than or equal to 75.',
    examples: [
      { input: 'UPDATE Students SET status = "PASSED" WHERE marks >= 75', output: '4 rows updated.', explanation: 'Updates status conditionally.' }
    ],
    constraints: ['Only update rows matching marks >= 75.'],
    hints: ['Syntax: `UPDATE Students SET status = "PASSED" WHERE marks >= 75;`'],
    solutionKeywords: ['UPDATE', 'Students', 'SET', 'status', 'PASSED', 'WHERE', 'marks'],
    starters: {
      sql: `-- Write your UPDATE statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'UPDATE Students SET status = PASSED WHERE marks >= 75', expected: 'Status updated for eligible students' }
    ],
    tableOutput: {
      columns: ['id', 'name', 'marks', 'status'],
      rows: [
        ['101', 'Ananya', '82', 'PASSED'],
        ['102', 'Dev', '91', 'PASSED'],
        ['103', 'Karan', '68', 'FAILED']
      ]
    }
  },
  {
    id: 'sql_9',
    title: 'Delete Inactive Users In-Place',
    category: 'SQL',
    difficulty: 'Easy',
    points: 40,
    tags: ['DML', 'DELETE', 'WHERE'],
    desc: 'Write an SQL statement to delete all users from the `Users` table where `last_login` date is before `"2025-01-01"` and `status = "INACTIVE"`.',
    examples: [
      { input: 'DELETE FROM Users WHERE last_login < "2025-01-01" AND status = "INACTIVE"', output: '2 rows deleted.', explanation: 'Cleans up inactive users.' }
    ],
    constraints: ['Use AND condition for both last_login and status.'],
    hints: ['Use `DELETE FROM Users WHERE last_login < "2025-01-01" AND status = "INACTIVE";`'],
    solutionKeywords: ['DELETE', 'FROM', 'Users', 'WHERE', 'last_login', 'INACTIVE'],
    starters: {
      sql: `-- Write your DELETE statement below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'DELETE FROM Users WHERE last_login < 2025-01-01 AND status = INACTIVE', expected: 'Inactive users deleted' }
    ],
    tableOutput: {
      columns: ['Affected Rows', 'Remaining Active Users'],
      rows: [['2', '145']]
    }
  },

  // ─── MODULE 3: SELECTION, FILTERING & SORTING ─────────────────────────────
  {
    id: 'sql_11',
    title: 'Basic Selection and Column Aliases',
    category: 'SQL',
    difficulty: 'Easy',
    points: 30,
    tags: ['DQL', 'SELECT', 'Alias'],
    desc: 'Write an SQL query to select `first_name` and `last_name` from `Employees` and display them as a single column named `Full_Name`, along with `job_title` as `Role`.',
    examples: [
      { input: 'SELECT CONCAT(first_name, " ", last_name) AS Full_Name, job_title AS Role FROM Employees', output: 'Full_Name | Role', explanation: 'Aliased output.' }
    ],
    constraints: ['Column headers must be Full_Name and Role.'],
    hints: ['Use `CONCAT(first_name, " ", last_name) AS Full_Name`.'],
    solutionKeywords: ['SELECT', 'CONCAT', 'first_name', 'last_name', 'Full_Name', 'job_title', 'Role', 'FROM', 'Employees'],
    starters: {
      sql: `-- Write your SELECT statement with aliases below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'SELECT Full_Name and Role', expected: 'Formatted Full_Name and Role columns' }
    ],
    tableOutput: {
      columns: ['Full_Name', 'Role'],
      rows: [
        ['Vikram Malhotra', 'Software Engineer'],
        ['Neha Gupta', 'Data Scientist'],
        ['Siddharth Rao', 'Product Manager']
      ]
    }
  },
  {
    id: 'sql_12',
    title: 'Filter Users by Email Domain using LIKE',
    category: 'SQL',
    difficulty: 'Easy',
    points: 35,
    tags: ['DQL', 'WHERE', 'LIKE', 'Wildcards'],
    desc: 'Write an SQL query to find all users from the `Users` table whose email address ends with `@gmail.com`.',
    examples: [
      { input: 'SELECT * FROM Users WHERE email LIKE "%@gmail.com"', output: 'Users with gmail addresses.', explanation: 'Matches ending string pattern.' }
    ],
    constraints: ['Use % wildcard.'],
    hints: ['Use `WHERE email LIKE "%@gmail.com"`.'],
    solutionKeywords: ['SELECT', 'FROM', 'Users', 'WHERE', 'email', 'LIKE', '@gmail.com'],
    starters: {
      sql: `-- Write your SELECT query using LIKE below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'WHERE email LIKE %@gmail.com', expected: 'Gmail users returned' }
    ],
    tableOutput: {
      columns: ['id', 'name', 'email'],
      rows: [
        ['1', 'Kabir Mehta', 'kabir@gmail.com'],
        ['3', 'Ishita Sen', 'ishita.sen@gmail.com']
      ]
    }
  },
  {
    id: 'sql_15',
    title: 'Sort Products by Category and Price DESC',
    category: 'SQL',
    difficulty: 'Easy',
    points: 40,
    tags: ['DQL', 'ORDER BY', 'Sorting'],
    desc: 'Write an SQL query to retrieve `product_name`, `category`, and `price` from `Products`, sorted alphabetically by `category` ASC, and then by `price` DESC.',
    examples: [
      { input: 'SELECT * FROM Products ORDER BY category ASC, price DESC', output: 'Multi-level sorted products.', explanation: 'Sorts by category then price.' }
    ],
    constraints: ['ORDER BY category ASC, price DESC.'],
    hints: ['Use `ORDER BY category ASC, price DESC`.'],
    solutionKeywords: ['SELECT', 'product_name', 'category', 'price', 'FROM', 'Products', 'ORDER', 'BY'],
    starters: {
      sql: `-- Write your ORDER BY query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'ORDER BY category ASC, price DESC', expected: 'Multi-column sorted product catalog' }
    ],
    tableOutput: {
      columns: ['product_name', 'category', 'price'],
      rows: [
        ['MacBook Pro 16', 'Electronics', '2499.00'],
        ['Dell XPS 15', 'Electronics', '1899.00'],
        ['Ergonomic Desk Chair', 'Furniture', '350.00']
      ]
    }
  },

  // ─── MODULE 5: AGGREGATION & GROUP BY / HAVING ─────────────────────────────
  {
    id: 'sql_22',
    title: 'Count Total Enrolled Students per Course',
    category: 'SQL',
    difficulty: 'Easy',
    points: 50,
    tags: ['Aggregation', 'COUNT', 'GROUP BY'],
    desc: 'Write an SQL query to report each `course_id` and the total number of enrolled students as `total_students` from the `Enrollments` table.',
    examples: [
      { input: 'SELECT course_id, COUNT(student_id) AS total_students FROM Enrollments GROUP BY course_id', output: 'Course enrolment counts.', explanation: 'Groups by course_id.' }
    ],
    constraints: ['Group by course_id.'],
    hints: ['Use `GROUP BY course_id` with `COUNT(student_id)`.'],
    solutionKeywords: ['SELECT', 'course_id', 'COUNT', 'total_students', 'FROM', 'Enrollments', 'GROUP', 'BY'],
    starters: {
      sql: `-- Write your GROUP BY COUNT query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'COUNT(student_id) GROUP BY course_id', expected: 'total_students per course' }
    ],
    tableOutput: {
      columns: ['course_id', 'total_students'],
      rows: [
        ['101', '342'],
        ['104', '215'],
        ['108', '98']
      ]
    }
  },
  {
    id: 'sql_24',
    title: 'Filter Grouped Results using HAVING Clause',
    category: 'SQL',
    difficulty: 'Medium',
    points: 75,
    tags: ['Aggregation', 'HAVING', 'GROUP BY'],
    desc: 'Write an SQL query to find all `department_id`s in `Employees` where the average salary is greater than `$75,000` and the department has more than 3 employees.',
    examples: [
      { input: 'SELECT department_id FROM Employees GROUP BY department_id HAVING AVG(salary) > 75000 AND COUNT(*) > 3', output: 'High paying departments.', explanation: 'HAVING filters aggregate values.' }
    ],
    constraints: ['Use HAVING for aggregate conditions.'],
    hints: ['Filter aggregated data using `HAVING AVG(salary) > 75000 AND COUNT(*) > 3`.'],
    solutionKeywords: ['SELECT', 'department_id', 'FROM', 'Employees', 'GROUP', 'BY', 'HAVING', 'AVG', 'COUNT'],
    starters: {
      sql: `-- Write your GROUP BY with HAVING query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'HAVING AVG(salary) > 75000 AND COUNT(*) > 3', expected: 'Filtered departments returned' }
    ],
    tableOutput: {
      columns: ['department_id', 'total_employees', 'avg_salary'],
      rows: [
        ['10', '8', '92400.00'],
        ['14', '5', '81000.00']
      ]
    }
  },

  // ─── MODULE 6: JOINS & RELATIONAL DATA ────────────────────────────────────
  {
    id: 'sql_27',
    title: 'Inner Join Students and Enrollment Tables',
    category: 'SQL',
    difficulty: 'Easy',
    points: 55,
    tags: ['Joins', 'INNER JOIN', 'Relational Query'],
    desc: 'Write an SQL query to retrieve `student_id`, `student_name`, and `course_title` by joining `Students s` and `Enrollments e` on `s.id = e.student_id`, and `Courses c` on `e.course_id = c.id`.',
    examples: [
      { input: 'SELECT s.id, s.name, c.title FROM Students s JOIN Enrollments e ON s.id = e.student_id JOIN Courses c ON e.course_id = c.id', output: 'Enrolled courses per student.', explanation: '3-table Inner Join.' }
    ],
    constraints: ['Return student_id, student_name, course_title.'],
    hints: ['Use `JOIN` syntax connecting Students -> Enrollments -> Courses.'],
    solutionKeywords: ['SELECT', 'Students', 'Enrollments', 'Courses', 'JOIN', 'ON'],
    starters: {
      sql: `-- Write your INNER JOIN query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'INNER JOIN Students, Enrollments, Courses', expected: 'Student course enrolment details' }
    ],
    tableOutput: {
      columns: ['student_id', 'student_name', 'course_title'],
      rows: [
        ['1', 'Aarav Patel', 'DSA & Algorithms in Java'],
        ['1', 'Aarav Patel', 'React & Next.js Professional'],
        ['2', 'Priya Sharma', 'Database & SQL Masterclass']
      ]
    }
  },
  {
    id: 'sql_28',
    title: 'Left Join Customers and Orders (Find Unordered Customers)',
    category: 'SQL',
    difficulty: 'Easy',
    points: 60,
    tags: ['Joins', 'LEFT JOIN', 'NULL Filtering'],
    desc: 'Write an SQL query using `LEFT JOIN` to report all customer names from `Customers` who have placed zero orders in `Orders`.',
    examples: [
      { input: 'SELECT c.name FROM Customers c LEFT JOIN Orders o ON c.id = o.customer_id WHERE o.id IS NULL', output: 'Unordered customers.', explanation: 'LEFT JOIN retains unmatched left rows.' }
    ],
    constraints: ['Use LEFT JOIN and WHERE o.id IS NULL.'],
    hints: ['`LEFT JOIN Orders ON ... WHERE Orders.id IS NULL` finds unmatched left table records.'],
    solutionKeywords: ['SELECT', 'Customers', 'LEFT', 'JOIN', 'Orders', 'ON', 'WHERE', 'NULL'],
    starters: {
      sql: `-- Write your LEFT JOIN query to find unordered customers below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'LEFT JOIN Customers and Orders WHERE o.id IS NULL', expected: 'Customers without orders returned' }
    ],
    tableOutput: {
      columns: ['Customers'],
      rows: [['Henry'], ['Max']]
    }
  },

  // ─── MODULE 7: SUBQUERIES ──────────────────────────────────────────────────
  {
    id: 'sql_34',
    title: 'Scalar Subquery: Employees Earning Above Average Salary',
    category: 'SQL',
    difficulty: 'Medium',
    points: 75,
    tags: ['Subquery', 'Scalar Subquery', 'AVG'],
    desc: 'Write an SQL query to find `id`, `name`, and `salary` of all employees in `Employees` who earn strictly more than the overall average salary.',
    examples: [
      { input: 'SELECT name, salary FROM Employees WHERE salary > (SELECT AVG(salary) FROM Employees)', output: 'Above average earners.', explanation: 'Compares salary against scalar average subquery.' }
    ],
    constraints: ['Use scalar subquery (SELECT AVG(salary) FROM Employees).'],
    hints: ['Place `(SELECT AVG(salary) FROM Employees)` inside the WHERE clause condition.'],
    solutionKeywords: ['SELECT', 'Employees', 'WHERE', 'salary', 'AVG'],
    starters: {
      sql: `-- Write your scalar subquery below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'WHERE salary > (SELECT AVG(salary))', expected: 'Above average earners returned' }
    ],
    tableOutput: {
      columns: ['id', 'name', 'salary'],
      rows: [
        ['105', 'Vikram Malhotra', '125000.00'],
        ['112', 'Neha Gupta', '98000.00']
      ]
    }
  },

  // ─── MODULE 9: WINDOW FUNCTIONS ─────────────────────────────────────────────
  {
    id: 'sql_44',
    title: 'Rank Top 3 Salaries per Department using DENSE_RANK()',
    category: 'SQL',
    difficulty: 'Medium',
    points: 100,
    tags: ['Window Function', 'DENSE_RANK', 'Top N'],
    desc: 'Write an SQL query to find employees who earn the top three salaries in each department. Use `DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)` as `rnk` in a CTE and filter `rnk <= 3`.',
    examples: [
      { input: 'WITH Ranked AS (...) SELECT * FROM Ranked WHERE rnk <= 3', output: 'Top 3 salaries per department.', explanation: 'DENSE_RANK handles duplicate salary ties.' }
    ],
    constraints: ['Filter rnk <= 3.'],
    hints: ['Wrap window function inside a CTE or derived table, then filter `WHERE rnk <= 3`.'],
    solutionKeywords: ['WITH', 'DENSE_RANK', 'OVER', 'PARTITION', 'BY', 'ORDER', 'DESC', 'WHERE', 'rnk'],
    starters: {
      sql: `-- Write your DENSE_RANK() CTE query below\n`,
      java: `String sql = "";`,
      cpp: `string sql = "";`,
      python: `sql = ""`,
      javascript: `const sql = "";`
    },
    testCases: [
      { input: 'DENSE_RANK() OVER (...) WHERE rnk <= 3', expected: 'Top 3 salaries per department returned' }
    ],
    tableOutput: {
      columns: ['Department', 'Employee', 'Salary'],
      rows: [
        ['Engineering', 'Vikram', '125000.00'],
        ['Engineering', 'Ananya', '95000.00'],
        ['Engineering', 'Rohan', '78000.00']
      ]
    }
  }
];
