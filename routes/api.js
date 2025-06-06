/**
 * API routes for Cost Manager service.
 * Provides endpoints to add costs, generate user reports, retrieve user details, and serve team info.
 * @module routes/api
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const Cost = require('../models/costs');
const User = require('../models/users');

/**
 * @route POST /api/add
 * @summary Add a new cost item to the database
 * @description Creates a new cost document using the request body. Requires description, category, userid, and sum. Optionally accepts a date.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - The body of the request
 * @param {string} req.body.description - Description of the cost item (required)
 * @param {string} req.body.category - Category of the cost (e.g., food, health, etc.) (required)
 * @param {string} req.body.userid - The ID of the user to whom the cost belongs (required)
 * @param {number} req.body.sum - The numeric cost amount (required)
 * @param {string} [req.body.date] - Optional date in ISO format (defaults to current date if not provided)

 * @param {Object} res - Express response object
 *
 * @returns {201} Created - Returns the saved cost object
 * @returns {400} Bad Request - If required fields are missing
 * @returns {500} Internal Server Error - If saving to the database fails
 */

router.post('/add', (req, res) => {

    const { description, category, userid, sum, date } = req.body;

// data validation
    if (!description || !category || !userid || !sum ) {
        return res.status(400).json({ error: 'Missing one or more from the required query parameters: description, category, userid or sum' });
    }

// check if user exists
    User.findOne({ id: Number(userid) })
        .then(user => {
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // create new cost schema
            const newCost = new Cost({
                description,
                category,
                userid: Number(userid),
                sum,
                date
            });

            // Attempts to save the new cost to the database.
            return newCost.save()
                .then(savedCost => {
                    res.status(201).json(savedCost);
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

/**
 * @route GET /api/report/?id=XXX&year=YYYY&month=MM
 * @summary Generates a monthly cost report for a specific user
 * @description
 * Retrieves all cost records for a given user ID, filtered by year and month.
 * Categorizes the costs into predefined categories and includes sum, description, and day for each item.
 *
 * @param {string} req.query.id - The user ID
 * @param {string|number} req.query.year - The target year
 * @param {string|number} req.query.month - The target month (1-12)
 *
 * @returns {Object} 200 - JSON object containing user ID, year, month, and categorized costs
 * @returns {400} If any of the required query parameters are missing
 * @returns {500} If a server/database error occurs
 */
router.get('/report', (req, res) => {

    const { id, year, month } = req.query;

    console.log('ID received:', req.query.id, typeof req.query.id);

    // Validate that all required query parameters are present
    if (!id || !year || !month) {
        return res.status(400).json({ error: 'Missing one or more from the required query parameters: id, year or month' });
    }

    // convert id to Number
    const userId = Number(id);

    // check if user exists
    User.findOne({ id: userId })
        .then(user => {
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Create the date range for the specified month
            const startDate = new Date(year, month - 1, 1); // First day of the month
            const endDate = new Date(year, month, 1); // First day of the next month

            // Find all cost records for the user within the given month
            Cost.find({
                userid: userId,
                date: { $gte: startDate, $lt: endDate }
            })
                .then(costs => {
                    // Define the fixed categories to group by
                    const categories = ['food', 'health', 'housing', 'sport', 'education'];

                    // Build an array of cost entries grouped by category
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

                    // Send the structured response back to the client
                    res.json({
                        userid: userId,
                        year: parseInt(year),
                        month: parseInt(month),
                        costs: costsArray
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

/**
 * @route GET /api/users/:id
 * @summary Retrieves user details along with the total cost of their expenses
 * @description
 * This endpoint fetches a user by their ID and calculates the total sum of all their costs
 * by aggregating all documents from the `Cost` collection where `userid` matches.
 *
 * @param {string} req.params.id - The unique identifier of the user to retrieve
 *
 * @returns {Object} 200 - JSON object with user ID, first name, last name, and total cost
 * @returns {404} If the user is not found
 * @returns {500} If there is a server or database error
 *
 * @example Response:
 * {
 *   "id": "123",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "total": 150
 * }
 */
router.get('/users/:id', (req, res) => {

    const userId = Number(req.params.id);

    // check if user exist
    User.findOne({ id: userId })
        .then(user => {
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            Cost.aggregate([
                // filter data by user
                {$match: { userid: userId } },
                // group data by userID and calc the sum
                {$group: {_id: null, total: {$sum: '$sum'}}}
            ])
                .then(result => {
                    const total = result.length > 0 ? result[0].total : 0;

                    // return data to user
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

/**
 * @route GET /about
 * @summary Serves the team information JSON file
 * @description
 * Sends the static JSON file containing team member details located at `public/data/team.json`.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {File} 200 - The contents of team.json
 * @returns {404} If the file is not found
 * @returns {500} If there is a server error while reading the file
 */
    router.get('/about', (req, res) => {
        const teamPath = path.join(__dirname, '../public/data/team.json');
        res.sendFile(teamPath);
    });

module.exports = router;
