import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AI Resume Analyzer backend is running!",
  });
});

// Analyze resume
app.post("/api/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "Resume text and job description are required.",
      });
    }

    const prompt = `
You are an expert ATS resume analyzer.

Analyze the following resume against the provided job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON using exactly this structure:

{
  "score": 0,
  "summary": "short summary",
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "missingSkills": [
    "skill 1",
    "skill 2"
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}

The score must be a number from 0 to 100.

Evaluate the resume based on:
- Skills
- Experience
- Projects
- Education
- Keywords
- Relevance to the job description
- Technical requirements

Be specific to the provided resume and job description.
Do not give a generic response.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    console.log("Gemini response received.");

    const result = JSON.parse(response.text);

    res.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      error: "Failed to analyze resume.",
      details: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});