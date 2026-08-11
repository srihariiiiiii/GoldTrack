const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

const PORT = 5000;

app.get("/api/prices", async (req, res) => {
    try {

        const [goldRes, silverRes] = await Promise.all([
            axios.get("https://api.gold-api.com/price/XAU"),
            axios.get("https://api.gold-api.com/price/XAG")
        ]);

        console.log("Gold API:", goldRes.data);
        console.log("Silver API:", silverRes.data);

        res.json({
            gold: goldRes.data,
            silver: silverRes.data
        });

    } catch (error) {

        console.error("API ERROR:", error);

        res.status(500).json({
            error: "Unable to fetch prices"
        });
    }
});

app.listen(PORT, () => {
    console.log("✅ Server running on http://localhost:5000");
});