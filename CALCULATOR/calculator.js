let display = document.getElementById("display");
let expression = "";

let recognition = null;
let isListening = false;
let isWakeWordMode = true;
let lastTranscript = "";

/* ================= VOICE INIT ================= */

/* ================= VOICE INIT ================= */

function initSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Use Chrome or Edge browser.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        const transcript =
            event.results[event.results.length - 1][0].transcript
                .toLowerCase()
                .trim();

        console.log("Voice:", transcript);

        // WAKE WORD MODE
        if (isWakeWordMode) {
            if (/\b(hey|hi|hello|ok)\s+(calculator|calc)\b/.test(transcript)) {
                isWakeWordMode = false;
                speakResult("Calculator activated");
                updateVoiceStatus("Listening for command...");
                return;
            }
        }

        // COMMAND MODE
        if (!isWakeWordMode) {
            processVoiceCommand(transcript);
        }
    };

    recognition.onerror = (e) => {
        console.log("Mic error:", e.error);
    };

    recognition.onend = () => {
        // Keep listening continuously unless explicitly stopped by closing page
        try {
            recognition.start();
        } catch(e) {}
    };
}




function updateVoiceStatus(text) {
    const el = document.getElementById("voice-status");
    if (el) el.textContent = text;
}

/* ================= VOICE PROCESS ================= */

function processVoiceCommand(transcript) {
    if (transcript.includes("stop") || transcript.includes("deactivate")) {
        isWakeWordMode = true;
        speakResult("Calculator deactivated");
        updateVoiceStatus('Waiting for "Hey Calculator"...');
        return;
    }

    if (transcript.includes("clear")) {
        clearDisplay();
        speakResult("Cleared");
        return;
    }

   // ===== Square Root Handling =====
if (transcript.includes("square root") || transcript.includes("root")) {

    let number = extractNumber(transcript);
    if (number !== null) {
        let result = Math.sqrt(number);
        expression = result.toString();
        updateDisplay();
        speakResult("Square root is " + result);
        return;
    }

    return findSquareRoot();
}

// ===== Square Handling =====
if (transcript.includes("square")) {

    let number = extractNumber(transcript);
    if (number !== null) {
        let result = number * number;
        expression = result.toString();
        updateDisplay();
        speakResult("Square is " + result);
        return;
    }

    return findSquare();
}
    if (transcript.includes("decimal to fraction")) return decimalToFraction();
    if (transcript.includes("fraction to decimal")) return fractionToDecimal();

    parseMath(transcript);
}

/* ================= NUMBER PARSER ================= */

function parseMath(transcript) {

    // 🔥 NEW: If transcript already contains numbers and operators
    if (/^[0-9+\-*/.\s]+$/.test(transcript)) {
        expression = transcript.replace(/\s+/g, "");
        updateDisplay();
        calculate();
        return;
    }

    // 🔽 Old word-based logic continues below

    transcript = transcript.replace(
        /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(one|two|three|four|five|six|seven|eight|nine)/g,
        "$1 $2"
    );

    const units = {
        zero: 0, one: 1, two: 2, three: 3, four: 4,
        five: 5, six: 6, seven: 7, eight: 8, nine: 9
    };

    const teens = {
        ten: 10, eleven: 11, twelve: 12, thirteen: 13,
        fourteen: 14, fifteen: 15, sixteen: 16,
        seventeen: 17, eighteen: 18, nineteen: 19
    };

    const tens = {
        twenty: 20, thirty: 30, forty: 40,
        fifty: 50, sixty: 60, seventy: 70,
        eighty: 80, ninety: 90
    };

    let words = transcript.split(/\s+/);
    let result = "";
    let i = 0;

    while (i < words.length) {
        let word = words[i];

        if (teens[word] !== undefined) {
            result += teens[word];
            i++;
            continue;
        }

        if (tens[word] !== undefined) {
            let value = tens[word];
            if (units[words[i + 1]] !== undefined) {
                value += units[words[i + 1]];
                i++;
            }
            result += value;
            i++;
            continue;
        }

        if (units[word] !== undefined) {
            result += units[word];
            i++;
            continue;
        }

        if (word.match(/plus|add|pulse/)) result += "+";
        else if (word.match(/minus|subtract/)) result += "-";
        else if (word.match(/times|multiply|into/)) result += "*";
        else if (word.match(/divide|divided|by/)) result += "/";
        else if (word === "point" || word === "dot") result += ".";

        i++;
    }

    if (!result) return;

    // SMART APPEND LOGIC
if (expression && /^[+\-*/]/.test(result)) {
    expression += result;
} else {
    expression = result;
}
    updateDisplay();

    if (/^[0-9+\-*/.]+$/.test(expression)) {
        calculate();
    }
}
/* ================= CALCULATOR ================= */

function appendNumber(num) {
    expression = expression === "0" ? num : expression + num;
    updateDisplay();
}

function appendOperator(op) {
    if (expression === "" && op !== "-") return;

    if (/[+\-*/]$/.test(expression)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    updateDisplay();
}

function updateDisplay() {
    display.value = expression || "0";
}

function clearDisplay() {
    expression = "";
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
}

function calculate() {
    if (!expression) return;

    try {
        if (!/^[0-9+\-*/.]+$/.test(expression))
            throw new Error("Invalid");

        let result = eval(expression);
        if (!isFinite(result)) throw new Error("Math Error");

        result = Math.round(result * 100000000) / 100000000;
        expression = result.toString();
        updateDisplay();
        speakResult("The result is " + result);
    } catch {
        display.value = "Error";
        expression = "";
    }
}

/* ================= EXTRA FEATURES ================= */

function findSquare() {
    let num = parseFloat(expression);
    if (isNaN(num)) return;
    let result = num * num;
    expression = result.toString();
    updateDisplay();
    speakResult("Square is " + result);
}

function findSquareRoot() {
    let num = parseFloat(expression);
    if (isNaN(num) || num < 0) {
        display.value = "Error";
        expression = "";
        return;
    }
    let result = Math.sqrt(num);
    expression = result.toString();
    updateDisplay();
    speakResult("Square root is " + result);
}

function decimalToFraction() {
    let decimal = parseFloat(expression);
    if (isNaN(decimal)) return;

    let denominator = 1000000;
    let numerator = Math.round(decimal * denominator);
    let gcdVal = gcd(numerator, denominator);

    expression = numerator / gcdVal + "/" + denominator / gcdVal;
    updateDisplay();
}

function fractionToDecimal() {
    if (!expression.includes("/")) return;

    let [n, d] = expression.split("/");
    let result = parseFloat(n) / parseFloat(d);

    expression = result.toString();
    updateDisplay();
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function speakResult(text) {
    if ("speechSynthesis" in window) {
        let utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        speechSynthesis.speak(utter);
    }
}
function extractNumber(text) {
    let match = text.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    initSpeechRecognition();
    if (recognition) {
        try {
            recognition.start();
            isListening = true;
            updateVoiceStatus('Waiting for "Hey Calculator"...');
        } catch (e) {
            updateVoiceStatus('Click anywhere to enable mic initially...');
            // Fallback for strict browsers requiring interact to start mic
            document.body.addEventListener('click', () => {
                try {
                    recognition.start();
                    updateVoiceStatus('Waiting for "Hey Calculator"...');
                } catch(err) {}
            }, {once: true});
        }
    }
});