const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const db = require('../../db');

class AIService {
  constructor() {
    this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async executeWithRetryAndFallback(promptText, schemaPrompt, retries = 3) {
    let lastError = null;

    // 1. Try Gemini
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: promptText + '\\n\\n' + schemaPrompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        
        return JSON.parse(response.text);
      } catch (error) {
        lastError = error;
        console.warn(`Gemini attempt ${i + 1} failed: ${error.message}`);
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000)); // Exponential backoff
      }
    }

    console.warn('Gemini exhausted retries. Falling back to OpenAI...');

    // 2. Try OpenAI Fallback
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.openAiClient.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful medical AI assistant. Always return strict JSON.' },
            { role: 'user', content: promptText + '\\n\\n' + schemaPrompt }
          ],
          response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
      } catch (error) {
        lastError = error;
        console.warn(`OpenAI attempt ${i + 1} failed: ${error.message}`);
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000)); // Exponential backoff
      }
    }

    console.error('Both Gemini and OpenAI failed completely.');
    // 3. Absolute Fallback Response
    return {
      status: "AI_SERVICE_UNAVAILABLE",
      message: "Our AI analysis service is temporarily unavailable. The raw data has been saved."
    };
  }

  async generatePreVisitSummary(appointmentId, symptomsRaw) {
    const promptText = `Analyze the following raw patient symptoms: "${symptomsRaw}".`;
    const schemaPrompt = `Return a JSON object with the following schema:
    {
      "urgency": "Low" | "Medium" | "High",
      "chief_complaint": "string (short summary)",
      "suggested_questions_for_doctor": ["string", "string", "string"]
    }`;

    const summaryData = await this.executeWithRetryAndFallback(promptText, schemaPrompt);

    await db.query(
      `INSERT INTO ai_summaries (appointment_id, summary_type, content) VALUES ($1, 'pre_visit', $2) RETURNING *`,
      [appointmentId, JSON.stringify(summaryData)]
    );

    return summaryData;
  }

  async generatePostVisitSummary(appointmentId, doctorId, patientId, clinicalNotes) {
    const promptText = `Analyze the following doctor's clinical notes: "${clinicalNotes}". Translate them into patient-friendly language.`;
    const schemaPrompt = `Return a JSON object with the following schema:
    {
      "patient_friendly_summary": "string",
      "medication_instructions": ["string"],
      "follow_up_advice": "string"
    }`;

    const summaryData = await this.executeWithRetryAndFallback(promptText, schemaPrompt);

    await db.query(
      `INSERT INTO ai_summaries (appointment_id, summary_type, content) VALUES ($1, 'post_visit', $2) RETURNING *`,
      [appointmentId, JSON.stringify(summaryData)]
    );

    return summaryData;
  }
}

module.exports = new AIService();
