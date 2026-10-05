const mysql = require('mysql2');

// Database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // replace with your MySQL username
    password: 'root', // replace with your MySQL password
    database: 'charityevents_db'
});

// Establish connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database. Thread ID: ' + db.threadId);
});

module.exports = db;