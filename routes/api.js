const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');
const User = require('../models/users');

// POST /api/add
router.post('/add', (req, res) => {
    const { description, category, userid, sum, date } = req.body;

    const newCost = new Cost({
        description,
        category,
        userid,
        sum,
        date // אם לא נשלח, המודל ישלים לבד עם default
    });

    newCost.save()
        .then(savedCost => {
            res.status(201).json(savedCost);
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

// GET /api/report?id=XXX&year=YYYY&month=MM
router.get('/report', (req, res) => {
    const { id, year, month } = req.query;

    if (!id || !year || !month) {
        return res.status(400).json({ error: 'Missing required query parameters: id, year, month' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    Cost.find({
        userid: id,
        date: { $gte: startDate, $lt: endDate }
    })
        .then(costs => {
            const categories = ['food', 'health', 'housing', 'sport', 'education'];

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
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

