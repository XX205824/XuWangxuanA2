const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== API Endpoints ====================

// 1. Get all event categories (for search page filters)
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch categories', detail: err.message });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// 2. Homepage: Get all active and upcoming events
app.get('/api/events/home', (req, res) => {
    const sql = `
        SELECT e.event_id, e.event_name, e.event_date, e.location, e.short_desc, 
               e.ticket_price, e.fundraising_goal, e.current_funds, e.status, e.event_image,
               c.category_name
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        WHERE e.status IN ('upcoming', 'ongoing')
        ORDER BY e.event_date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch events', detail: err.message });
        }
        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// 3. Search events by date, location and category
app.get('/api/events/search', (req, res) => {
    const { date, location, category_id } = req.query;
    let sql = `
        SELECT e.event_id, e.event_name, e.event_date, e.location, e.short_desc,
               e.ticket_price, e.status, e.event_image, c.category_name
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        WHERE e.status IN ('upcoming', 'ongoing')
    `;
    const params = [];

    // Dynamically append filter conditions
    if (date) {
        sql += ' AND DATE(e.event_date) = ?';
        params.push(date);
    }
    if (location) {
        sql += ' AND e.location LIKE ?';
        params.push(`%${location}%`);
    }
    if (category_id) {
        sql += ' AND e.category_id = ?';
        params.push(category_id);
    }

    sql += ' ORDER BY e.event_date ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Event search failed', detail: err.message });
        }
        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// 4. Get single event details by ID
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = `
        SELECT e.*, c.category_name, o.org_name, o.org_description, o.contact_email
        FROM events e
        JOIN categories c ON e.category_id = c.category_id
        JOIN organisations o ON e.org_id = o.org_id
        WHERE e.event_id = ?
    `;
    
    db.query(sql, [eventId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch event details', detail: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});