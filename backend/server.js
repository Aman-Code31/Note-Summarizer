const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const mongoose = require('mongoose'); // <--- Import Mongoose

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- DATABASE CONNECTION ---
// Connect to a local MongoDB database named "smart-notes"
mongoose.connect('mongodb://127.0.0.1:27017/smart-notes')
  .then(() => console.log(" Connected to MongoDB"))
  .catch(err => console.error(" MongoDB Connection Error:", err));

// --- DATABASE SCHEMA ---
// This defines the structure of our data
const noteSchema = new mongoose.Schema({
  originalText: String,
  summary: String,
  keywords: [String],
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// --- ROUTES ---

app.get('/', (req, res) => res.send("Backend is running! 🚀"));

// 1. Summarize Endpoint (Calls Python)
app.post('/api/summarize', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const pythonProcess = spawn('python3', ['ai_logic.py', text]);
    let dataString = '';

    pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { console.error(`Python Error: ${data}`); });

    pythonProcess.on('close', (code) => {
        try {
            const result = JSON.parse(dataString);
            res.json(result);
        } catch (e) {
            console.error("Error parsing Python output:", e);
            res.status(500).send("Error processing text");
        }
    });
});

// 2. Save Endpoint (New!)
app.post('/api/save', async (req, res) => {
  try {
    const { originalText, summary, keywords } = req.body;
    const newNote = new Note({ originalText, summary, keywords });
    await newNote.save();
    res.json({ message: "Note saved successfully!", note: newNote });
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
  }
});

// 3. History Endpoint (New!)
app.get('/api/history', async (req, res) => {
  try {
    // Get all notes, sorted by newest first
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});