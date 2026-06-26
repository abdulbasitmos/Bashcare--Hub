const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

router.post('/ai-chat', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'Question is required' });
  }

  const systemPrompt = `
    You are a helpful AI support assistant for Bashcare Hub, a modern healthcare platform.
    Your goal is to answer user questions about our services, booking process, and platform features.
    
    Here is some context about our website:
    - Homepage: /
    - Get Started/Registration: /get-started
    - Our Services: /services
    - Contact Us: /contact
    - Help/Support: /help
    - Patient Dashboard: /dashboard/patient
    - Doctor Dashboard: /dashboard/doctor
    
    Always provide helpful, compassionate, and accurate information.
    If the user asks about something specific, try to provide a direct link to the relevant page on our website based on the context above.
  `;

  // Fallback chain: try each model in order until one succeeds
  const modelFallbacks = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ];

  let lastError = null;

  for (const modelName of modelFallbacks) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt + "\n\nUser Question: " + question);
      const response = await result.response;
      console.log(`AI responded using model: ${modelName}`);
      return res.json({ response: response.text() });
    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
    }
  }

  // All models failed
  console.error('All Gemini models failed. Last error:', lastError?.message);
  res.status(500).json({ message: 'Failed to get response from AI. Please try again later.', error: lastError?.message });
});

router.post('/ai-symptom-check', async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms description is required' });
  }

  const systemPrompt = `
    You are a medical AI analysis assistant for Bashcare Hub. 
    Analyze the user's symptoms and classify them.
    You MUST respond with a raw JSON object only. Do NOT wrap the JSON in backticks, markdown code blocks, or include any extra text. 
    The JSON object must contain exactly these keys:
    1. "matched": boolean (true if the symptoms map to Neurology, Cardiology, Gastroenterology, Orthopedics, or Dermatology; false otherwise)
    2. "specialty": string (Must be exactly one of: "Neurology", "Cardiology", "Gastroenterology", "Orthopedics", "Dermatology". If matched is false, set this to "General Medicine")
    3. "suggestion": string (a concise condition/reason, e.g. "Tension Headache", "Gastroesophageal Reflux", "Potential Cardiac strain", "Muscle Strain", "Contact Dermatitis")
    4. "text": string (a compassionate, informative summary of the symptoms, advice to see the suggested specialist, and a warning to seek emergency care immediately if experiencing severe chest pain, breathing difficulties, or sudden numbness)
    5. "wellness_tips": array of strings (exactly 3 actionable, symptom-specific wellness tips or lifestyle guidance that the user can consider at home before their appointment)

    User Symptoms: "${symptoms}"
  `;

  const modelFallbacks = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ];

  let lastError = null;

  for (const modelName of modelFallbacks) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code blocks if the model generated them
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      // Parse JSON to validate response format
      const parsedData = JSON.parse(text);
      console.log(`AI Symptom Check succeeded using model: ${modelName}`);
      return res.json(parsedData);
    } catch (error) {
      console.warn(`Model ${modelName} failed for symptom check: ${error.message}`);
      lastError = error;
    }
  }

  console.error('All Gemini models failed for symptom check. Last error:', lastError?.message);
  res.status(500).json({ message: 'Failed to analyze symptoms. Please try again later.', error: lastError?.message });
});

router.post('/ai-vitals-check', async (req, res) => {
  const { vitalsList } = req.body;

  if (!vitalsList || !Array.isArray(vitalsList) || vitalsList.length === 0) {
    return res.status(400).json({ message: 'Vitals history list is required' });
  }

  const systemPrompt = `
    You are a medical AI analysis assistant for Bashcare Hub.
    Analyze the patient's recent vitals log history and provide a high-level clinical review and wellness guidelines.
    Recent logged vitals list (object properties: bpm, bpSys, bpDia, spo2, temp): 
    ${JSON.stringify(vitalsList)}

    You MUST respond with a raw JSON object only. Do NOT wrap the JSON in backticks, markdown code blocks, or include any extra text.
    The JSON object must contain exactly these keys:
    1. "assessment": string (a compassionate, clear, clinical-sounding analysis of their heart rate, blood pressure, oxygen saturation, and body temperature trends over these days)
    2. "riskLevel": string (Must be exactly one of: "Low", "Medium", "High")
    3. "wellnessTips": array of strings (exactly 3 personalized wellness, hydration, diet, activity, or sleep guidelines custom-tailored to their readings)
  `;

  const modelFallbacks = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ];

  let lastError = null;

  for (const modelName of modelFallbacks) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code blocks if the model generated them
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      const parsedData = JSON.parse(text);
      console.log(`AI Vitals Check succeeded using model: ${modelName}`);
      return res.json(parsedData);
    } catch (error) {
      console.warn(`Model ${modelName} failed for vitals check: ${error.message}`);
      lastError = error;
    }
  }

  console.error('All Gemini models failed for vitals check. Last error:', lastError?.message);
  res.status(500).json({ message: 'Failed to analyze vitals. Please try again later.', error: lastError?.message });
});

module.exports = router;
