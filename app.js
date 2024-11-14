const express = require('express');
const PouchDB = require('pouchdb');

const app = express();
app.use(express.json());

// Create a new PouchDB instance
const db = new PouchDB('app-state');

app.get('/', async (req, res) => {
    try {
        res.json({
            state: 'up',
            apps: 1
        })
    } catch (err) {
        res.status(500).json({ error: 'Error reading state' });

    }
})

// Route to get the app's state
app.get('/chat-ui', async (req, res) => {
    try {
        const doc = await db.get('chat-ui-state');
        res.json({ state: doc.state });
    } catch (err) {
        if (err.status === 404) {
            // If the document doesn't exist, create a new one with 'up' state
            await db.put({ _id: 'chat-ui-state', state: 'down' });
            res.json({ state: 'down' });
        } else {
            res.status(500).json({ error: 'Error fetching app state' });
        }
    }
});

// Route to update the app's state
app.post('/chat-ui', express.json(), async (req, res) => {
    try {
        const { state } = req.body;
        const doc = await db.get('chat-ui-state');
        doc.state = state;
        await db.put(doc);
        res.json({ state: doc.state });
    } catch (err) {
        res.status(500).json({ error: 'Error updating app state' });
    }
});

const port = process.env.PORT || 5300;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});