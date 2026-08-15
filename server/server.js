const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================
   FRONTEND
========================================= */

// Works both locally and on Render/cloud servers
const CLIENT_PATH = path.resolve(process.cwd(), "client");

console.log("📁 Serving client from:", CLIENT_PATH);

app.use(express.static(CLIENT_PATH));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(CLIENT_PATH, "index.html")
    );
});


/* =========================================
   SERVER
========================================= */

const PORT = process.env.PORT || 5000;


/* =========================================
   CACHE
========================================= */

let cachedGold = null;
let cachedSilver = null;


/* =========================================
   API URLs
========================================= */

const GOLD_API =
    "https://api.gold-api.com/price/XAU";

const SILVER_API =
    "https://api.gold-api.com/price/XAG";


/* =========================================
   PRICE API
========================================= */

app.get("/api/prices", async (req, res) => {

    console.log("\n====================================");
    console.log("🔄 Fetching latest market prices...");
    console.log("====================================");


    let goldData = null;
    let silverData = null;


    /* =====================================
       GOLD
    ===================================== */

    try {

        const goldResponse =
            await axios.get(
                GOLD_API,
                {
                    timeout: 15000,
                    headers: {
                        "Accept": "application/json",
                        "User-Agent":
                            "GoldTrack/1.0"
                    }
                }
            );


        if (
            goldResponse.data &&
            Number.isFinite(
                Number(goldResponse.data.price)
            )
        ) {

            goldData =
                goldResponse.data;

            cachedGold =
                goldData;

            console.log(
                "✅ Gold API successful"
            );

            console.log(
                "🥇 Gold:",
                goldData
            );

        } else {

            throw new Error(
                "Invalid Gold API response"
            );
        }


    } catch (error) {

        console.error(
            "❌ Gold API failed:",
            error.message
        );


        // Use previous successful price
        if (cachedGold) {

            goldData =
                cachedGold;

            console.log(
                "♻️ Using cached Gold price"
            );
        }
    }


    /* =====================================
       SILVER
    ===================================== */

    try {

        const silverResponse =
            await axios.get(
                SILVER_API,
                {
                    timeout: 15000,
                    headers: {
                        "Accept": "application/json",
                        "User-Agent":
                            "GoldTrack/1.0"
                    }
                }
            );


        if (
            silverResponse.data &&
            Number.isFinite(
                Number(
                    silverResponse.data.price
                )
            )
        ) {

            silverData =
                silverResponse.data;

            cachedSilver =
                silverData;

            console.log(
                "✅ Silver API successful"
            );

            console.log(
                "🥈 Silver:",
                silverData
            );

        } else {

            throw new Error(
                "Invalid Silver API response"
            );
        }


    } catch (error) {

        console.error(
            "❌ Silver API failed:",
            error.message
        );


        // Use previous successful price
        if (cachedSilver) {

            silverData =
                cachedSilver;

            console.log(
                "♻️ Using cached Silver price"
            );
        }
    }


    /* =====================================
       CHECK GOLD
    ===================================== */

    if (!goldData) {

        console.error(
            "❌ Gold price is unavailable"
        );

        return res.status(503).json({

            error:
                "Gold market data temporarily unavailable",

            goldAvailable: false,

            silverAvailable:
                !!silverData
        });
    }


    /* =====================================
       CHECK SILVER
    ===================================== */

    if (!silverData) {

        console.error(
            "❌ Silver price is unavailable"
        );

        return res.status(503).json({

            error:
                "Silver market data temporarily unavailable",

            goldAvailable:
                !!goldData,

            silverAvailable: false
        });
    }


    /* =====================================
       SEND DATA
    ===================================== */

    console.log(
        "✅ Sending Gold + Silver data"
    );


    res.json({

        gold: goldData,

        silver: silverData,

        status: "success",

        updatedAt:
            new Date().toISOString()
    });

});


/* =========================================
   HEALTH CHECK
========================================= */

app.get("/health", (req, res) => {

    res.json({

        status: "OK",

        server: "GoldTrack",

        goldCached:
            !!cachedGold,

        silverCached:
            !!cachedSilver,

        time:
            new Date().toISOString()
    });

});


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "\n========================================"
        );
        console.log(
            "  ✅ GoldTrack Server is RUNNING!"
        );
        console.log(
            "========================================\n"
        );
        console.log(
            `  🌐 OPEN WEBSITE  -->  http://localhost:${PORT}`
        );
        console.log(
            `\n  📊 Price API     -->  http://localhost:${PORT}/api/prices`
        );
        console.log(
            `  ❤️  Health Check  -->  http://localhost:${PORT}/health`
        );
        console.log(
            "\n========================================"
        );
        console.log(
            "  Ctrl+C to stop the server"
        );
        console.log(
            "========================================\n"
        );
    }
);