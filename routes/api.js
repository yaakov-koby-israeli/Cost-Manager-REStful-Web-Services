const express = require('express');
const router = express.Router();
const path = require('path');
const Cost = require('../models/costs');
const User = require('../models/users');

// POST /api/add
router.post('/add', (req, res) => {
    const { description, category, userid, sum, date } = req.body;

    // data validation
    if (!description || !category || !userid || !sum ) {
        return res.status(400).json({error: 'Missing one or more from the required query parameters: description, category, userid or sum '});
    }

    // if exists create cost
    const newCost = new Cost({
        description,
        category,
        userid,
        sum,
        date
    });

    return newCost.save()
        .then(savedCost => {
            res.status(201).json(savedCost);
        })

    .catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// GET /api/report?id=XXX&year=YYYY&month=MM
router.get('/report', (req, res) => {
    const {id, year, month} = req.query;

    console.log('ID received:', req.query.id, typeof req.query.id);

    // data validation
    if (!id || !year || !month) {
        return res.status(400).json({error: 'Missing one or more from the required query parameters: id, year or month'});
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    Cost.find({
        userid: id,
        date: {$gte: startDate, $lt: endDate}
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
            res.status(500).json({error: err.message});
        });
});

// GET /api/users/:id
router.get('/users/:id', (req, res) => {

    const userId = req.params.id;

    // check if user exist
    User.findOne({ id: userId.toString() })
        .then(user => {
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            // calc of user total costs
            Cost.aggregate([
                {$match: {userid: userId}},
                {$group: {_id: null, total: {$sum: '$sum'}}}
            ])
                .then(result => {
                    const total = result.length > 0 ? result[0].total : 0;

                    // return data
                    res.json({
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        total: total
                    });
                })
                .catch(err => {
                    res.status(500).json({error: err.message});
                });
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});

// GET /api/about
    router.get('/about', (req, res) => {
        const teamPath = path.join(__dirname, '../public/data/team.json');
        res.sendFile(teamPath);
    });

module.exports = router;
