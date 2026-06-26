const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
    console.log("Listing models...");
    // We can list models using fetch or via the SDK if supported, or direct HTTP fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.AI_API_KEY}`);
    const data = await response.json();
    console.log("Models found:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

run();
