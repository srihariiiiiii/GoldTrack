/* =========================================================
   GOLDTRACK 3D - COMPLETE SCRIPT
   ========================================================= */

/* =========================
   BACKEND CONFIGURATION
========================= */

const BACKEND_API_URL = "http://localhost:5000/api/prices";

const OUNCE_TO_GRAM = 31.1035;

// Default USD → INR conversion.
// Change this if your backend later provides live currency conversion.
const USD_TO_INR_DEFAULT = 87;


/* =========================
   GOLD PURITY
========================= */

const PURITY_MAP = {
    "24": 1.000,
    "22": 0.916,
    "18": 0.750
};


/* =========================
   PRICE VARIABLES
========================= */

let goldPriceUSD = 0;
let silverPriceUSD = 0;

let goldPriceINRPerGram24K = 0;
let goldPriceINRPerGram22K = 0;
let goldPriceINRPerGram18K = 0;

let silverPriceINRPerGram = 0;
let silverPriceINRPerKg = 0;


/* =========================
   PREVIOUS PRICE
========================= */

let previousGoldPrice = 0;
let previousSilverPrice = 0;


/* =========================
   FETCH STATUS
========================= */

let isFetching = false;


/* =========================
   PRICE HISTORY
========================= */

const priceHistory = [];

const MAX_HISTORY = 10;


/* =========================
   DOM ELEMENTS
========================= */

// Gold
const gold24Element = document.getElementById("gold24");
const gold22Element = document.getElementById("gold22");
const gold18Element = document.getElementById("gold18");

// Silver
const silverPriceElement =
    document.getElementById("silver-price");

// Trend
const goldTrendElement =
    document.getElementById("gold-trend");

const silverTrendElement =
    document.getElementById("silver-trend");

// Buttons
const goldButton =
    document.getElementById("gold-btn");

const silverButton =
    document.getElementById("silver-btn");

// Status
const lastUpdatedElement =
    document.getElementById("last-updated");

// Calculator
const weightElement =
    document.getElementById("gold-weight");

const goldTypeElement =
    document.getElementById("gold-type");

const calculateButton =
    document.getElementById("calculate-btn");

const calculatedPriceElement =
    document.getElementById("calculated-price");

// Chart
const priceChartCanvas =
    document.getElementById("priceChart");

const chartTooltip =
    document.getElementById("chart-tooltip");


/* =========================================================
   HELPER FUNCTIONS
========================================================= */


/* =========================
   FORMAT RUPEE
========================= */

function formatRupee(value) {

    if (!Number.isFinite(value)) {
        return "₹ 0.00";
    }

    return "₹ " + value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "0.00";
    }

    return value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


/* =========================
   UPDATE STATUS
========================= */

function updateStatus(message) {

    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = message;
    }
}


/* =========================
   SET TREND TEXT
========================= */

function setTrend(element, percentage) {

    if (!element) {
        return;
    }

    if (!Number.isFinite(percentage)) {

        element.textContent =
            "⏳ Waiting for next update...";

        element.className = "trend same";

        return;
    }


    if (percentage > 0) {

        element.textContent =
            `🟢 +${percentage.toFixed(2)}%`;

        element.className = "trend up";

    } else if (percentage < 0) {

        element.textContent =
            `🔴 ${percentage.toFixed(2)}%`;

        element.className = "trend down";

    } else {

        element.textContent =
            "⚪ 0.00%";

        element.className = "trend same";
    }
}


/* =========================================================
   RENDER PRICE UI
========================================================= */

function renderPriceUI() {

    /* ---------- GOLD ---------- */

    if (gold24Element) {

        gold24Element.textContent =
            goldPriceINRPerGram24K > 0
                ? `${formatRupee(goldPriceINRPerGram24K)} / gram`
                : "Loading...";
    }


    if (gold22Element) {

        gold22Element.textContent =
            goldPriceINRPerGram22K > 0
                ? `${formatRupee(goldPriceINRPerGram22K)} / gram`
                : "Loading...";
    }


    if (gold18Element) {

        gold18Element.textContent =
            goldPriceINRPerGram18K > 0
                ? `${formatRupee(goldPriceINRPerGram18K)} / gram`
                : "Loading...";
    }


    /* ---------- SILVER ---------- */

    if (silverPriceElement) {

        silverPriceElement.textContent =
            silverPriceINRPerGram > 0
                ? `${formatRupee(silverPriceINRPerGram)} / gram`
                : "Loading...";
    }


    /* ---------- OPTIONAL NEW UI ELEMENTS ---------- */

    const silverKgElement =
        document.getElementById("silver-kg");

    if (silverKgElement) {

        silverKgElement.textContent =
            silverPriceINRPerKg > 0
                ? formatRupee(silverPriceINPerKg)
                : formatRupee(silverPriceINPerKg);
    }


    // Alternative IDs for newer GoldTrack 3D design

    const gold24New =
        document.getElementById("gold-24-price");

    if (gold24New) {
        gold24New.textContent =
            formatRupee(goldPriceINRPerGram24K);
    }


    const gold22New =
        document.getElementById("gold-22-price");

    if (gold22New) {
        gold22New.textContent =
            formatRupee(goldPriceINRPerGram22K);
    }


    const gold18New =
        document.getElementById("gold-18-price");

    if (gold18New) {
        gold18New.textContent =
            formatRupee(goldPriceINRPerGram18K);
    }


    const silverNew =
        document.getElementById("silver-price-value");

    if (silverNew) {
        silverNew.textContent =
            formatRupee(silverPriceINRPerGram);
    }


    const silverKgNew =
        document.getElementById("silver-kg-price");

    if (silverKgNew) {
        silverKgNew.textContent =
            formatRupee(silverPriceINPerKg);
    }
}


/* =========================================================
   TREND CALCULATION
========================================================= */

function updateTrendIndicators() {

    let goldChange = 0;
    let silverChange = 0;


    if (previousGoldPrice > 0) {

        goldChange =
            ((goldPriceINRPerGram24K -
                previousGoldPrice) /
                previousGoldPrice) * 100;
    }


    if (previousSilverPrice > 0) {

        silverChange =
            ((silverPriceINPerGram -
                previousSilverPrice) /
                previousSilverPrice) * 100;
    }


    setTrend(
        goldTrendElement,
        goldChange
    );


    setTrend(
        silverTrendElement,
        silverChange
    );


    // New UI trend IDs

    const goldTrendNew =
        document.getElementById("gold-change");

    if (goldTrendNew) {

        goldTrendNew.textContent =
            `${goldChange >= 0 ? "+" : ""}${goldChange.toFixed(2)}%`;
    }


    const silverTrendNew =
        document.getElementById("silver-change");

    if (silverTrendNew) {

        silverTrendNew.textContent =
            `${silverChange >= 0 ? "+" : ""}${silverChange.toFixed(2)}%`;
    }
}


/* =========================================================
   ADD HISTORY
========================================================= */

function addHistoryPoint(
    goldPrice,
    silverPrice
) {

    if (
        !Number.isFinite(goldPrice) ||
        !Number.isFinite(silverPrice)
    ) {
        return;
    }


    const now = new Date();


    priceHistory.push({

        time: now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        ),

        gold: goldPrice,

        silver: silverPrice
    });


    while (
        priceHistory.length > MAX_HISTORY
    ) {

        priceHistory.shift();
    }
}


/* =========================================================
   DRAW CHART
========================================================= */

function updateChart() {

    if (!priceChartCanvas) {
        return;
    }


    const canvas =
        priceChartCanvas;

    const ctx =
        canvas.getContext("2d");


    if (!ctx) {
        return;
    }


    const rect =
        canvas.getBoundingClientRect();


    const width =
        rect.width || 800;


    const height =
        rect.height || 350;


    const devicePixelRatio =
        window.devicePixelRatio || 1;


    canvas.width =
        width * devicePixelRatio;


    canvas.height =
        height * devicePixelRatio;


    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );


    /* ---------- CLEAR ---------- */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (priceHistory.length < 2) {

        ctx.fillStyle =
            "#888";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Waiting for price updates...",
            width / 2,
            height / 2
        );

        return;
    }


    /* ---------- VALUES ---------- */

    const goldValues =
        priceHistory.map(
            item => item.gold
        );

    const silverValues =
        priceHistory.map(
            item => item.silver
        );


    const allValues =
        goldValues.concat(
            silverValues
        );


    let min =
        Math.min(...allValues);

    let max =
        Math.max(...allValues);


    if (min === max) {

        min -= 1;
        max += 1;
    }


    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;


    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    /* ---------- GRID ---------- */

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

    ctx.lineWidth = 1;


    for (let i = 0; i <= 4; i++) {

        const y =
            paddingTop +
            (chartHeight / 4) * i;


        ctx.beginPath();

        ctx.moveTo(
            paddingLeft,
            y
        );

        ctx.lineTo(
            width - paddingRight,
            y
        );

        ctx.stroke();
    }


    /* ---------- DRAW LINE ---------- */

    function drawLine(
        values,
        lineColor
    ) {

        if (values.length < 2) {
            return;
        }


        ctx.beginPath();


        values.forEach(
            (value, index) => {

                const x =
                    paddingLeft +
                    (index /
                        (values.length - 1)) *
                    chartWidth;


                const y =
                    paddingTop +
                    chartHeight -
                    ((value - min) /
                        (max - min)) *
                    chartHeight;


                if (index === 0) {

                    ctx.moveTo(x, y);

                } else {

                    ctx.lineTo(x, y);
                }
            }
        );


        ctx.strokeStyle =
            lineColor;

        ctx.lineWidth = 3;

        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";

        ctx.shadowBlur = 8;

        ctx.shadowColor =
            lineColor;

        ctx.stroke();

        ctx.shadowBlur = 0;
    }


    drawLine(
        goldValues,
        "#f5c542"
    );


    drawLine(
        silverValues,
        "#d8d8d8"
    );


    /* ---------- LEGEND ---------- */

    ctx.font =
        "13px Arial";

    ctx.textAlign =
        "left";


    ctx.fillStyle =
        "#f5c542";

    ctx.fillText(
        "● Gold",
        paddingLeft,
        18
    );


    ctx.fillStyle =
        "#d8d8d8";

    ctx.fillText(
        "● Silver",
        paddingLeft + 70,
        18
    );


    /* ---------- X AXIS LABELS ---------- */

    ctx.fillStyle =
        "#888";

    ctx.font =
        "11px Arial";


    priceHistory.forEach(
        (item, index) => {

            if (
                index === 0 ||
                index === priceHistory.length - 1
            ) {

                const x =
                    paddingLeft +
                    (index /
                        (priceHistory.length - 1)) *
                    chartWidth;


                ctx.textAlign =
                    index === 0
                        ? "left"
                        : "right";


                ctx.fillText(
                    item.time,
                    x,
                    height - 12
                );
            }
        }
    );
}


/* =========================================================
   FETCH LIVE PRICES
========================================================= */

async function fetchLivePrices() {

    if (isFetching) {
        return;
    }


    isFetching = true;


    console.log(
        "🔄 Fetching live Gold & Silver prices..."
    );


    updateStatus(
        "⏳ Syncing latest market price..."
    );


    try {

        const response =
            await fetch(
                BACKEND_API_URL,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    signal:
                        AbortSignal.timeout(10000)
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "📦 API DATA:",
            data
        );


        /* ---------- VALIDATE DATA ---------- */

        if (
            !data ||
            !data.gold ||
            !data.silver
        ) {

            throw new Error(
                "Invalid price data received from backend"
            );
        }


        const newGoldUSD =
            Number(
                data.gold.price
            );


        const newSilverUSD =
            Number(
                data.silver.price
            );


        if (
            !Number.isFinite(newGoldUSD) ||
            !Number.isFinite(newSilverUSD) ||
            newGoldUSD <= 0 ||
            newSilverUSD <= 0
        ) {

            throw new Error(
                "Invalid Gold/Silver price values"
            );
        }


        /* ---------- SAVE PREVIOUS ---------- */

        previousGoldPrice =
            goldPriceINRPerGram24K;


        previousSilverPrice =
            silverPriceINRPerGram;


        /* ---------- USD PRICE ---------- */

        goldPriceUSD =
            newGoldUSD;


        silverPriceUSD =
            newSilverUSD;


        /* =================================================
           GOLD USD/OZ → INR/GRAM
        ================================================= */

        goldPriceINRPerGram24K =
            (
                goldPriceUSD *
                USD_TO_INR_DEFAULT
            ) /
            OUNCE_TO_GRAM;


        /* ---------- 22K ---------- */

        goldPriceINRPerGram22K =
            goldPriceINRPerGram24K *
            PURITY_MAP["22"];


        /* ---------- 18K ---------- */

        goldPriceINRPerGram18K =
            goldPriceINRPerGram24K *
            PURITY_MAP["18"];


        /* =================================================
           SILVER USD/OZ → INR/GRAM
        ================================================= */

        silverPriceINRPerGram =
            (
                silverPriceUSD *
                USD_TO_INR_DEFAULT
            ) /
            OUNCE_TO_GRAM;


        /* ---------- SILVER KG ---------- */

        silverPriceINRPerKg =
            silverPriceINRPerGram *
            1000;


        /* =================================================
           UPDATE WEBSITE
        ================================================= */

        renderPriceUI();


        updateTrendIndicators();


        addHistoryPoint(
            goldPriceINRPerGram24K,
            silverPriceINRPerGram
        );


        updateChart();


        calculateGoldValue();


        /* =================================================
           LAST UPDATED
        ================================================= */

        const now =
            new Date();


        updateStatus(
            `Last Updated: ${now.toLocaleTimeString()} | Connected to Live Market Data`
        );


        /* =================================================
           SUCCESS LOG
        ================================================= */

        console.log(
            "================================="
        );

        console.log(
            "✅ LIVE MARKET DATA UPDATED"
        );

        console.log(
            "Gold USD/oz:",
            goldPriceUSD
        );

        console.log(
            "Silver USD/oz:",
            silverPriceUSD
        );

        console.log(
            "Gold 24K INR/gram:",
            goldPriceINRPerGram24K
        );

        console.log(
            "Gold 22K INR/gram:",
            goldPriceINRPerGram22K
        );

        console.log(
            "Gold 18K INR/gram:",
            goldPriceINRPerGram18K
        );

        console.log(
            "Silver INR/gram:",
            silverPriceINRPerGram
        );

        console.log(
            "================================="
        );


    } catch (error) {

        console.error(
            "❌ Price fetch failed:",
            error
        );


        updateStatus(
            "🔴 Unable to update price"
        );


        /*
         * If we already have valid prices,
         * keep showing them.
         */

        if (
            goldPriceINRPerGram24K > 0 &&
            silverPriceINRPerGram > 0
        ) {

            renderPriceUI();

            calculateGoldValue();

            console.log(
                "ℹ️ Keeping previous valid market prices."
            );

        } else {

            if (gold24Element) {
                gold24Element.textContent =
                    "Error";
            }

            if (gold22Element) {
                gold22Element.textContent =
                    "Error";
            }

            if (gold18Element) {
                gold18Element.textContent =
                    "Error";
            }

            if (silverPriceElement) {
                silverPriceElement.textContent =
                    "Error";
            }
        }


    } finally {

        isFetching = false;
    }
}


/* =========================================================
   GOLD CALCULATOR
========================================================= */

function calculateGoldValue() {

    if (
        !weightElement ||
        !goldTypeElement ||
        !calculatedPriceElement
    ) {
        return;
    }


    const weight =
        Number(
            weightElement.value
        );


    const goldType =
        goldTypeElement.value;


    if (
        !Number.isFinite(weight) ||
        weight <= 0
    ) {

        calculatedPriceElement.textContent =
            "₹ 0.00";

        updateCalculatorExtraUI(
            0,
            0
        );

        return;
    }


    let pricePerGram = 0;


    if (goldType === "24") {

        pricePerGram =
            goldPriceINRPerGram24K;

    } else if (goldType === "22") {

        pricePerGram =
            goldPriceINRPerGram22K;

    } else if (goldType === "18") {

        pricePerGram =
            goldPriceINRPerGram18K;
    }


    if (pricePerGram <= 0) {

        calculatedPriceElement.textContent =
            "₹ 0.00";

        return;
    }


    /* ---------- BASE PRICE ---------- */

    const basePrice =
        weight *
        pricePerGram;


    /* =================================================
       OPTIONAL GST
    ================================================= */

    const gstCheckbox =
        document.getElementById(
            "gst-checkbox"
        ) ||
        document.getElementById(
            "include-gst"
        );


    const makingCheckbox =
        document.getElementById(
            "making-checkbox"
        ) ||
        document.getElementById(
            "include-making"
        );


    let gst =
        0;

    let makingCharge =
        0;


    if (
        gstCheckbox &&
        gstCheckbox.checked
    ) {

        gst =
            basePrice * 0.03;
    }


    if (
        makingCheckbox &&
        makingCheckbox.checked
    ) {

        makingCharge =
            basePrice * 0.05;
    }


    const total =
        basePrice +
        gst +
        makingCharge;


    calculatedPriceElement.textContent =
        formatRupee(total);


    updateCalculatorExtraUI(
        basePrice,
        gst + makingCharge
    );


    /* ---------- WEIGHT PREVIEW ---------- */

    const weightPreview =
        document.getElementById(
            "weight-preview"
        );


    if (weightPreview) {

        weightPreview.textContent =
            `${formatNumber(weight)} Grams`;
    }
}


/* =========================================================
   CALCULATOR EXTRA UI
========================================================= */

function updateCalculatorExtraUI(
    basePrice,
    extraCharges
) {

    const baseElement =
        document.getElementById(
            "base-metal-price"
        );


    const extraElement =
        document.getElementById(
            "extra-charges"
        );


    if (baseElement) {

        baseElement.textContent =
            formatRupee(basePrice);
    }


    if (extraElement) {

        extraElement.textContent =
            formatRupee(extraCharges);
    }
}


/* =========================================================
   GOLD REFRESH BUTTON
========================================================= */

if (goldButton) {

    goldButton.addEventListener(
        "click",
        async function () {

            await fetchLivePrices();

        }
    );
}


/* =========================================================
   SILVER REFRESH BUTTON
========================================================= */

if (silverButton) {

    silverButton.addEventListener(
        "click",
        async function () {

            await fetchLivePrices();

        }
    );
}


/* =========================================================
   CALCULATOR BUTTON
========================================================= */

if (calculateButton) {

    calculateButton.addEventListener(
        "click",
        function () {

            calculateGoldValue();

        }
    );
}


/* =========================================================
   CALCULATOR LIVE UPDATE
========================================================= */

if (weightElement) {

    weightElement.addEventListener(
        "input",
        function () {

            calculateGoldValue();

        }
    );
}


if (goldTypeElement) {

    goldTypeElement.addEventListener(
        "change",
        function () {

            calculateGoldValue();

        }
    );
}


/* =========================================================
   GST / MAKING CHARGE LIVE UPDATE
========================================================= */

const gstCheckboxElement =
    document.getElementById(
        "gst-checkbox"
    ) ||
    document.getElementById(
        "include-gst"
    );


const makingCheckboxElement =
    document.getElementById(
        "making-checkbox"
    ) ||
    document.getElementById(
        "include-making"
    );


if (gstCheckboxElement) {

    gstCheckboxElement.addEventListener(
        "change",
        calculateGoldValue
    );
}


if (makingCheckboxElement) {

    makingCheckboxElement.addEventListener(
        "change",
        calculateGoldValue
    );
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function () {

        updateChart();

    }
);


/* =========================================================
   AUTO REFRESH
========================================================= */

// Fetch immediately
fetchLivePrices();


// Refresh every 60 seconds
setInterval(
    fetchLivePrices,
    60000
);


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🪙 GoldTrack 3D initialized"
        );

        console.log(
            "🔗 Backend:",
            BACKEND_API_URL
        );

        console.log(
            "💱 Currency: INR"
        );

        console.log(
            "📊 Chart history:",
            MAX_HISTORY,
            "updates"
        );

    }
);