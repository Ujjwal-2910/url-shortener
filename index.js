import express from 'express';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import 'dotenv/config'

const app = express();
const PORT = process.env.port;

mongoose.connect(process.env.mongodbConnect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Mongoose is connected");
}).catch(() => {
    console.log("Mongoose is not connected");
});

const urlSchema = new mongoose.Schema({
    originalURL: { type: String, unique: true },
    shortURL: { type: String, unique: true },
});

const URL = mongoose.model('url', urlSchema);

app.use(express.json());

app.get('/', (req, res) => {
    res.render('index.ejs', { shortURL: '' });
});

app.post('/shorten', async (req, res) => {
    const { originalURL } = req.body;

    try {
        const url = await URL.create({ originalURL: "http://" + originalURL, shortURL: nanoid(10) });
        res.json({ shortURL: url.shortURL });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (originalURL already exists)
            const existingURL = await URL.findOne({ originalURL: "http://" + originalURL });
            res.json({ shortURL: existingURL.shortURL });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.get('/:shortURL', async (req, res) => {
    const { shortURL } = req.params;
    const url = await URL.findOne({ shortURL });
    if (url) {
        res.redirect(url.originalURL);
    } else {
        res.status(404).json({ error: 'URL not found' });
    }
});


app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });