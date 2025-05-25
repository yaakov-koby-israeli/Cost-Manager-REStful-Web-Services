const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');

// POST /api/add
router.post('/add', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        const newCost = new Cost({
            description,
            category,
            userid,
            sum,
            date
        });

        const savedCost = await newCost.save();
        res.status(201).json(savedCost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

// GET /api/report?id=XXX&year=YYYY&month=MM
router.get('/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        if (!id || !year || !month) {
            return res.status(400).json({ error: 'Missing required query parameters: id, year, month' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const costs = await Cost.find({
            userid: id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const categories = ['food', 'health', 'housing', 'sport', 'education'];

        // התחלה עם מערך costs ריק
        const costsArray = categories.map(category => {
            return {
                [category]: costs
                    .filter(c => c.category === category)
                    .map(c => ({
                        sum: c.sum,
                        description: c.description,
                        day: c.date.getDate()
                    }))
            };
        });

        res.json({
            userid: id,
            year: parseInt(year),
            month: parseInt(month),
            costs: costsArray
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

