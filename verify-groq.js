
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

// 1. Load Environment Variables from .env.local
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log("Loading .env.local...");
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error("❌ .env.local file NOT FOUND!");
}

const apiKey = process.env.VITE_GROQ_API_KEY;

console.log("--------------------------------------------------");
console.log("Diagnostic Check:");
console.log("1. Env File Exists: ", fs.existsSync(envLocalPath) ? "✅ Yes" : "❌ No");
console.log("2. Key Found:       ", apiKey ? `✅ Yes (${apiKey.substring(0, 10)}...)` : "❌ No");

if (!apiKey) {
    console.error("❌ Critical: No API Key found. Script aborting.");
    process.exit(1);
}

const groq = new Groq({ apiKey: apiKey });

async function testComp() {
    console.log("3. Testing API Connection to Groq (Llama 3)...");
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello' in French" }],
            model: "llama3-70b-8192",
        });
        console.log("✅ API Response Success:", completion.choices[0]?.message?.content);
        console.log("--------------------------------------------------");
        console.log("CONCLUSION: The API Key and File are 100% CORRECT.");
    } catch (e) {
        console.error("❌ API Call Failed:", e.message);
        console.log("--------------------------------------------------");
        console.log("CONCLUSION: The Key exists but is invalid/blocked.");
    }
}

testComp();
