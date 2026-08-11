// ======================================================
// GOLDTRACK - COMPLETE SCRIPT.JS
// ======================================================

const API_URL = "http://localhost:5000/api/prices";

const USD_TO_INR = 87;
const OUNCE_TO_GRAM = 31.1035;

const GOLD_22K = 0.916;
const GOLD_18K = 0.750;

const MAX_HISTORY = 10;

let previousGoldPrice = null;
let previousSilverPrice = null;

let goldPricePerGram = 0;
let silverPricePerGram = 0;

let priceHistory = [];

let chartAnimation = null;


// ======================================================
// DOM ELEMENTS
// ======================================================

const gold24Element = document.getElementById("gold24");
const gold22Element = document.getElementById("gold22");
const gold18Element = document.getElementById("gold18");

const silverElement =
    document.getElementById("silver-price");

const goldTrend =
    document.getElementById("gold-trend");

const silverTrend =
    document.getElementById("silver-trend");

const lastUpdated =
    document.getElementById("last-updated");

const goldButton =
    document.getElementById("gold-btn");

const silverButton =
    document.getElementById("silver-btn");

const calculateButton =
    document.getElementById("calculate-btn");

const weightInput =
    document.getElementById("gold-weight");

const goldType =
    document.getElementById("gold-type");

const calculatedPrice =
    document.getElementById("calculated-price");


// ======================================================
// FORMAT CURRENCY
// ======================================================

function formatINR(value) {

    return "₹ " +
        Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) +
        " / gram";
}


// ======================================================
// GOLD PRICE CONVERSION
// ======================================================

function convertGoldPrice(priceUSD) {

    return (
        priceUSD *
        USD_TO_INR
    ) / OUNCE_TO_GRAM;

}


// ======================================================
// SILVER PRICE CONVERSION
// ======================================================

function convertSilverPrice(priceUSD) {

    return (
        priceUSD *
        USD_TO_INR
    ) / OUNCE_TO_GRAM;

}


// ======================================================
// TREND
// ======================================================

function updateTrend(
    current,
    previous,
    element,
    name
) {

    if (!element) return;

    if (previous === null) {

        element.textContent =
            "🟢 Live price updated";

        element.className =
            "trend up";

        return;
    }

    if (current > previous) {

        element.textContent =
            `🟢 ${name} price increased`;

        element.className =
            "trend up";

    }
    else if (current < previous) {

        element.textContent =
            `🔴 ${name} price decreased`;

        element.className =
            "trend down";

    }
    else {

        element.textContent =
            `➖ ${name} price unchanged`;

        element.className =
            "trend same";

    }

}


// ======================================================
// ADD HISTORY
// ======================================================

function addHistory(
    gold,
    silver
) {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    priceHistory.push({

        gold: gold,
        silver: silver,
        time: time

    });

    if (
        priceHistory.length >
        MAX_HISTORY
    ) {

        priceHistory.shift();

    }

}


// ======================================================
// FETCH LIVE PRICES
// ======================================================

async function getPrices() {

    console.log(
        "Fetching live prices..."
    );

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "API Response:",
            data
        );


        // ----------------------------------------------
        // Validate API response
        // ----------------------------------------------

        if (
            !data.gold ||
            !data.silver ||
            typeof data.gold.price !== "number" ||
            typeof data.silver.price !== "number"
        ) {

            throw new Error(
                "Invalid API response"
            );

        }


        // ----------------------------------------------
        // Convert prices
        // ----------------------------------------------

        const gold24 =
            convertGoldPrice(
                data.gold.price
            );

        const gold22 =
            gold24 * GOLD_22K;

        const gold18 =
            gold24 * GOLD_18K;

        const silver =
            convertSilverPrice(
                data.silver.price
            );


        goldPricePerGram =
            gold24;

        silverPricePerGram =
            silver;


        // ----------------------------------------------
        // Update Gold UI
        // ----------------------------------------------

        if (gold24Element) {

            gold24Element.textContent =
                formatINR(gold24);

        }

        if (gold22Element) {

            gold22Element.textContent =
                formatINR(gold22);

        }

        if (gold18Element) {

            gold18Element.textContent =
                formatINR(gold18);

        }


        // ----------------------------------------------
        // Update Silver UI
        // ----------------------------------------------

        if (silverElement) {

            silverElement.textContent =
                formatINR(silver);

        }


        // ----------------------------------------------
        // Trends
        // ----------------------------------------------

        updateTrend(
            gold24,
            previousGoldPrice,
            goldTrend,
            "Gold"
        );

        updateTrend(
            silver,
            previousSilverPrice,
            silverTrend,
            "Silver"
        );


        // ----------------------------------------------
        // Save previous values
        // ----------------------------------------------

        previousGoldPrice =
            gold24;

        previousSilverPrice =
            silver;


        // ----------------------------------------------
        // History
        // ----------------------------------------------

        addHistory(
            gold24,
            silver
        );


        // ----------------------------------------------
        // Status
        // ----------------------------------------------

        if (lastUpdated) {

            lastUpdated.textContent =
                "Last Updated: " +
                (
                    data.gold.updatedAtReadable ||
                    "Just now"
                );

        }


        // ----------------------------------------------
        // Chart
        // ----------------------------------------------

        drawPriceChart();


        console.log(
            "Prices updated successfully"
        );

    }
    catch (error) {

        console.error(
            "Price Fetch Error:",
            error
        );


        if (gold24Element)
            gold24Element.textContent =
                "Error";

        if (gold22Element)
            gold22Element.textContent =
                "Error";

        if (gold18Element)
            gold18Element.textContent =
                "Error";

        if (silverElement)
            silverElement.textContent =
                "Error";


        if (goldTrend) {

            goldTrend.textContent =
                "🔴 Unable to update price";

            goldTrend.className =
                "trend down";

        }


        if (silverTrend) {

            silverTrend.textContent =
                "🔴 Unable to update price";

            silverTrend.className =
                "trend down";

        }

    }

}


// ======================================================
// GOLD BUTTON
// ======================================================

if (goldButton) {

    goldButton.addEventListener(
        "click",
        async () => {

            goldButton.disabled =
                true;

            goldButton.textContent =
                "⏳ Updating...";

            await getPrices();

            goldButton.disabled =
                false;

            goldButton.textContent =
                "🔄 Refresh Gold Price";

        }
    );

}


// ======================================================
// SILVER BUTTON
// ======================================================

if (silverButton) {

    silverButton.addEventListener(
        "click",
        async () => {

            silverButton.disabled =
                true;

            silverButton.textContent =
                "⏳ Updating...";

            await getPrices();

            silverButton.disabled =
                false;

            silverButton.textContent =
                "🔄 Refresh Silver Price";

        }
    );

}


// ======================================================
// GOLD CALCULATOR
// ======================================================

function calculateGoldPrice() {

    if (!weightInput ||
        !goldType ||
        !calculatedPrice) {

        return;

    }

    const weight =
        parseFloat(
            weightInput.value
        );

    const type =
        goldType.value;


    if (
        isNaN(weight) ||
        weight <= 0
    ) {

        calculatedPrice.textContent =
            "₹ 0.00";

        return;

    }


    let pricePerGram =
        goldPricePerGram;


    if (type === "22") {

        pricePerGram =
            goldPricePerGram *
            GOLD_22K;

    }
    else if (type === "18") {

        pricePerGram =
            goldPricePerGram *
            GOLD_18K;

    }


    const total =
        weight *
        pricePerGram;


    calculatedPrice.textContent =
        "₹ " +
        total.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


if (calculateButton) {

    calculateButton.addEventListener(
        "click",
        calculateGoldPrice
    );

}


// ======================================================
// CHART
// ======================================================

function drawPriceChart() {

    const canvas =
        document.getElementById(
            "priceChart"
        );

    if (!canvas) {

        console.log(
            "priceChart canvas not found"
        );

        return;

    }

    if (
        priceHistory.length < 2
    ) {

        return;

    }


    const parent =
        canvas.parentElement;

    const width =
        parent.clientWidth;

    const height =
        parent.clientHeight || 350;

    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 45;
    const paddingBottom = 40;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    // ----------------------------------------------
    // Normalize
    // ----------------------------------------------

    function normalize(values) {

        const min =
            Math.min(...values);

        const max =
            Math.max(...values);

        const range =
            max - min || 1;

        return values.map(
            value =>
                (value - min) /
                range
        );

    }


    const goldValues =
        priceHistory.map(
            item => item.gold
        );

    const silverValues =
        priceHistory.map(
            item => item.silver
        );


    const goldNormalized =
        normalize(
            goldValues
        );

    const silverNormalized =
        normalize(
            silverValues
        );


    function makePoints(values) {

        return values.map(
            (value, index) => {

                const x =
                    paddingLeft +
                    (
                        index /
                        (values.length - 1)
                    ) *
                    chartWidth;

                const y =
                    paddingTop +
                    (
                        1 - value
                    ) *
                    chartHeight;

                return {
                    x,
                    y
                };

            }
        );

    }


    const goldPoints =
        makePoints(
            goldNormalized
        );

    const silverPoints =
        makePoints(
            silverNormalized
        );


    // ----------------------------------------------
    // Draw smooth curve
    // ----------------------------------------------

    function drawLine(
        points,
        mainColor,
        glowColor,
        progress
    ) {

        if (!points.length)
            return;


        const count =
            Math.max(
                2,
                Math.ceil(
                    points.length *
                    progress
                )
            );


        const visible =
            points.slice(
                0,
                count
            );


        ctx.beginPath();

        ctx.moveTo(
            visible[0].x,
            visible[0].y
        );


        for (
            let i = 1;
            i < visible.length;
            i++
        ) {

            const p0 =
                visible[i - 1];

            const p1 =
                visible[i];

            const midX =
                (p0.x + p1.x) / 2;

            const midY =
                (p0.y + p1.y) / 2;


            ctx.quadraticCurveTo(
                p0.x,
                p0.y,
                midX,
                midY
            );

        }


        const last =
            visible[
                visible.length - 1
            ];


        ctx.lineTo(
            last.x,
            last.y
        );


        // Big glow

        ctx.save();

        ctx.strokeStyle =
            glowColor;

        ctx.lineWidth = 14;

        ctx.globalAlpha =
            0.12;

        ctx.lineCap =
            "round";

        ctx.shadowBlur =
            30;

        ctx.shadowColor =
            glowColor;

        ctx.stroke();

        ctx.restore();


        // Medium glow

        ctx.save();

        ctx.strokeStyle =
            glowColor;

        ctx.lineWidth = 8;

        ctx.globalAlpha =
            0.25;

        ctx.lineCap =
            "round";

        ctx.shadowBlur =
            20;

        ctx.shadowColor =
            glowColor;

        ctx.stroke();

        ctx.restore();


        // Main line

        ctx.save();

        ctx.strokeStyle =
            mainColor;

        ctx.lineWidth = 3;

        ctx.lineCap =
            "round";

        ctx.lineJoin =
            "round";

        ctx.shadowBlur =
            10;

        ctx.shadowColor =
            glowColor;

        ctx.stroke();

        ctx.restore();


        // Glowing point

        ctx.save();

        const pulse =
            5 +
            Math.sin(
                Date.now() / 180
            ) * 2;


        ctx.beginPath();

        ctx.arc(
            last.x,
            last.y,
            pulse * 2.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            glowColor;

        ctx.globalAlpha =
            0.15;

        ctx.shadowBlur =
            30;

        ctx.shadowColor =
            glowColor;

        ctx.fill();

        ctx.restore();


        // Main dot

        ctx.beginPath();

        ctx.arc(
            last.x,
            last.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            mainColor;

        ctx.shadowBlur =
            15;

        ctx.shadowColor =
            glowColor;

        ctx.fill();


        // White center

        ctx.beginPath();

        ctx.arc(
            last.x,
            last.y,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();

    }


    // ----------------------------------------------
    // Grid + legend
    // ----------------------------------------------

    function drawBackground() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // Grid

        ctx.save();

        ctx.strokeStyle =
            "rgba(255,255,255,0.07)";

        ctx.lineWidth = 1;


        for (
            let i = 0;
            i <= 4;
            i++
        ) {

            const y =
                paddingTop +
                (
                    chartHeight / 4
                ) * i;


            ctx.beginPath();

            ctx.moveTo(
                paddingLeft,
                y
            );

            ctx.lineTo(
                width -
                paddingRight,
                y
            );

            ctx.stroke();

        }

        ctx.restore();


        // Legend

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";


        ctx.fillStyle =
            "#d4af37";

        ctx.fillText(
            "● Gold",
            paddingLeft,
            20
        );


        ctx.fillStyle =
            "#d7dce3";

        ctx.fillText(
            "● Silver",
            paddingLeft + 75,
            20
        );


        // Time labels

        ctx.font =
            "10px Arial";

        ctx.fillStyle =
            "#888";

        ctx.textAlign =
            "center";


        priceHistory.forEach(
            (item, index) => {

                const x =
                    paddingLeft +
                    (
                        index /
                        (
                            priceHistory.length -
                            1
                        )
                    ) *
                    chartWidth;


                ctx.fillText(
                    item.time,
                    x,
                    height - 15
                );

            }
        );

    }


    // ----------------------------------------------
    // Smooth animation
    // ----------------------------------------------

    if (chartAnimation) {

        cancelAnimationFrame(
            chartAnimation
        );

    }


    const start =
        performance.now();

    const duration =
        1200;


    function animate(now) {

        const elapsed =
            now - start;

        let progress =
            elapsed / duration;


        progress =
            Math.min(
                progress,
                1
            );


        // Ease

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        drawBackground();


        drawLine(
            goldPoints,
            "#d4af37",
            "#ffd84d",
            eased
        );


        drawLine(
            silverPoints,
            "#d7dce3",
            "#ffffff",
            eased
        );


        if (
            progress < 1
        ) {

            chartAnimation =
                requestAnimationFrame(
                    animate
                );

        }

    }


    chartAnimation =
        requestAnimationFrame(
            animate
        );

}


// ======================================================
// WINDOW RESIZE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        if (
            priceHistory.length >= 2
        ) {

            drawPriceChart();

        }

    }
);


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "GoldTrack started"
        );

        getPrices();

        // Update every 30 seconds

        setInterval(
            getPrices,
            30000
        );

    }
);