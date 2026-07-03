const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const db = require('../../db');

class AIService {
  constructor() {
    this._geminiClient = null;
    this._openAiClient = null;
  }

  get geminiClient() {
    if (!this._geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : undefined;
      this._geminiClient = new GoogleGenAI({ apiKey });
    }
    return this._geminiClient;
  }

  get openAiClient() {
    if (!this._openAiClient) {
      const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : undefined;
      this._openAiClient = new OpenAI({ apiKey });
    }
    return this._openAiClient;
  }

  async executeWithRetryAndFallback(promptText, schemaPrompt, retries = 3) {
    let lastError = null;

    // 1. Try Gemini
    for (let i = 0; i < retries; i++) {
      try {
        const interaction = await this.geminiClient.interactions.create({
          model: process.env.GEMINI_MODEL,
          input: promptText + '\\n\\n' + schemaPrompt,
        });
        let responseText = interaction.output_text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          responseText = jsonMatch[0];
        }
        return JSON.parse(responseText);
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
          model: process.env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: 'You are a helpful medical AI assistant. Always return strict JSON.' },
            { role: 'user', content: promptText + '\\n\\n' + schemaPrompt }
          ],
          response_format: { type: 'json_object' }
        });

        let responseText = response.choices[0].message.content;
        const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          responseText = jsonMatch[0];
        }
        return JSON.parse(responseText);
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
      `INSERT INTO ai_summaries (appointment_id, summary_type, urgency_level, chief_complaint, suggested_questions) VALUES ($1, 'pre_visit', $2, $3, $4) RETURNING *`,
      [appointmentId, summaryData.urgency, summaryData.chief_complaint, JSON.stringify(summaryData.suggested_questions_for_doctor)]
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
      `INSERT INTO ai_summaries (appointment_id, summary_type, patient_friendly_summary, medication_schedule, follow_up_instructions) VALUES ($1, 'post_visit', $2, $3, $4) RETURNING *`,
      [appointmentId, summaryData.patient_friendly_summary, JSON.stringify(summaryData.medication_instructions), summaryData.follow_up_advice]
    );

    await db.query(
      `UPDATE appointments SET status = 'completed' WHERE id = $1`,
      [appointmentId]
    );

    return summaryData;
  }
}

module.exports = new AIService();
