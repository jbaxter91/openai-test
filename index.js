require('dotenv').config();
//const openai = require("openai");
const fs = require("fs");
const express = require("express");
const multer = require('multer');
const axios = require("axios");
const app = express();

app.use(express.json());

const API_KEY = process.env.OPEN_AI_KEY;
const upload = multer({ dest: 'uploads/' });

async function sendTextToDavinci(text) {
    try {
        const response = await axios({
            method: "post",
            url: "https://api.openai.com/v1/engines/davinci/completions",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            data: {
                prompt: text,
                temperature: 0.5,
                max_tokens: 100
            }
        });
        console.log(response.data);
        return response.data.choices[0].text;
    } catch (error) {
        throw error;
    }
}

app.post("/generate", async (req, res) => {
    try {
        if (!req.body.text) {
            throw new Error('Text is missing!');
        }
        console.log(`recieved text: ${req.body.text}`);
        const response = await sendTextToDavinci(req.body.text);
        res.send({ message: response });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

app.post("/generate-file", upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('File is missing!');
        }
        const response = await sendTextToDavinci(fs.readFileSync(req.file.path, "utf8"));
        res.send({ message: response });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});