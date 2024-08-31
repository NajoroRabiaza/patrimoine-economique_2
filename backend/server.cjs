const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 6000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const filePath = path.join(__dirname, '..', 'client', 'src', 'data', 'data.json');

/**
 * Reads possessions from the JSON file.
 * @returns {Array} - List of possessions.
 */
function getPossessions() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const patrimoine = jsonData.find(item => item.model === 'Patrimoine');
        return patrimoine ? patrimoine.data.possessions : [];
    } catch (err) {
        console.error('Error reading JSON file:', err);
        return [];
    }
}

/**
 * Adds a new possession to the JSON file.
 * @param {Object} newPossession - The new possession to add.
 * @returns {Array} - Updated list of possessions.
 */
function addPossession(newPossession) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const patrimoine = jsonData.find(item => item.model === 'Patrimoine');

        if (patrimoine) {
            patrimoine.data.possessions.push(newPossession);
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            return patrimoine.data.possessions;
        } else {
            throw new Error('Patrimoine not found');
        }
    } catch (err) {
        console.error('Error updating JSON file:', err);
        throw err;
    }
}

/**
 * Updates an existing possession in the JSON file.
 * @param {string} libelle - The label of the possession to update.
 * @param {Object} newValues - The new values to apply.
 * @returns {Object} - The updated possession.
 */
function updatePossession(libelle, newValues) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const patrimoine = jsonData.find(item => item.model === 'Patrimoine');
        const possession = patrimoine?.data.possessions.find(p => p.libelle === libelle);

        if (possession) {
            Object.assign(possession, newValues);
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            return possession;
        } else {
            throw new Error('Possession not found');
        }
    } catch (err) {
        console.error('Error updating JSON file:', err);
        throw err;
    }
}

/**
 * Closes a possession by setting its end date to the current date.
 * @param {string} libelle - The label of the possession to close.
 * @returns {string} - The end date of the possession.
 */
function closePossession(libelle) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const patrimoine = jsonData.find(item => item.model === 'Patrimoine');
        const possession = patrimoine?.data.possessions.find(p => p.libelle === libelle);

        if (possession) {
            possession.dateFin = new Date().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            return possession.dateFin;
        } else {
            throw new Error('Possession not found');
        }
    } catch (err) {
        console.error('Error closing possession:', err);
        throw err;
    }
}

// Routes
app.get('/', (req, res) => {
    res.send('Express server is running!');
});

app.get('/possession', (req, res) => {
    const possessions = getPossessions();
    res.json(possessions);
});

app.post('/possession', (req, res) => {
    const newPossession = req.body;
    try {
        const possessions = addPossession(newPossession);
        res.status(201).json(possessions);
    } catch (err) {
        res.status(500).json({ error: 'Server error while adding possession.' });
    }
});

app.patch('/possession/:libelle', (req, res) => {
    const { libelle } = req.params;
    const newValues = req.body;

    try {
        const updatedPossession = updatePossession(libelle, newValues);
        res.status(200).json(updatedPossession);
    } catch (err) {
        res.status(500).json({ error: 'Server error while updating possession.' });
    }
});

app.patch('/possession/:libelle/close', (req, res) => {
    const { libelle } = req.params;

    try {
        const closedPossession = closePossession(libelle);
        res.status(200).json({ dateFin: closedPossession });
    } catch (err) {
        res.status(500).json({ error: 'Server error while closing possession.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
