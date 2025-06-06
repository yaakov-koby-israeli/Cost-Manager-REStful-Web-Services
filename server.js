/**
 * Entry point of the Cost Manager server.
 * Starts the Express server on the specified PORT.
 * @module server
 */

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});