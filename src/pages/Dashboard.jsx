import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ==============================
  // PDF UPLOAD & TEXT EXTRACTION
  // ==============================

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);
    setResumeText("");

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      let text = "";

      for (let page = 1; page <= pdf.numPages; page++) {
        const pdfPage = await pdf.getPage(page);
        const content = await pdfPage.getTextContent();

        const pageText = content.items
          .map((item) => item.str)
          .join(" ");

        text += pageText + "\n";
      }

      setResumeText(text.trim());

      console.log("Resume text extracted successfully.");
    } catch (error) {
      console.error("PDF extraction error:", error);

      alert("Could not read this PDF.");
      setSelectedFile(null);
    }
  };

  // ==============================
  // AI RESUME ANALYSIS
  // ==============================

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      console.log("Sending resume to backend...");

      const response = await fetch(
        "https://ai-resume-analyzer-api-g81v.onrender.com/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            resumeText: resumeText,
            jobDescription: jobDescription,
          }),
        }
      );

      console.log("Backend status:", response.status);

      const contentType = response.headers.get("content-type");

      // ==============================
      // HANDLE BACKEND ERRORS
      // ==============================

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Backend error:", {
          status: response.status,
          response: errorText,
        });

        throw new Error(
          `Backend returned ${response.status}: ${errorText.substring(
            0,
            200
          )}`
        );
      }

      // ==============================
      // CHECK JSON RESPONSE
      // ==============================

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error("Non-JSON response:", responseText);

        throw new Error(
          "Backend returned a non-JSON response."
        );
      }

      // ==============================
      // READ AI RESULT
      // ==============================

      const result = await response.json();

      console.log("AI analysis result:", result);

      setAnalysis(result);
    } catch (error) {
      console.error("Analysis error:", error);

      alert(
        `Could not analyze the resume.\n\n${error.message}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ==============================
          NAVBAR
      ============================== */}

      <nav className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">
            AI Resume Analyzer
          </h1>
        </div>
      </nav>

      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <main className="max-w-6xl mx-auto p-8">

        <h2 className="text-3xl font-bold mb-2">
          Resume Analysis Dashboard
        </h2>

        <p className="text-gray-600 mb-8">
          Upload your resume and compare it with a job description.
        </p>

        {/* ==============================
            RESUME UPLOAD
        ============================== */}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          <h3 className="text-xl font-bold mb-4">
            📄 Upload Resume
          </h3>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="block w-full"
          />

          {selectedFile && (
            <p className="mt-4 text-green-600 font-semibold">
              ✅ {selectedFile.name}
            </p>
          )}

          {resumeText && (
            <p className="mt-2 text-sm text-gray-500">
              Resume text extracted successfully.
            </p>
          )}

        </div>

        {/* ==============================
            JOB DESCRIPTION
        ============================== */}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          <h3 className="text-xl font-bold mb-4">
            💼 Job Description
          </h3>

          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setAnalysis(null);
            }}
            placeholder="Paste the job description here..."
            className="w-full h-48 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-sm text-gray-500 mt-2">
            Paste the complete job description for better AI analysis.
          </p>

        </div>

        {/* ==============================
            ANALYZE BUTTON
        ============================== */}

        <button
          onClick={analyzeResume}
          disabled={isAnalyzing}
          className={`text-white font-semibold px-8 py-3 rounded-xl shadow transition ${
            isAnalyzing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isAnalyzing
            ? "🤖 AI is analyzing..."
            : "🤖 Analyze Resume"}
        </button>

        {/* ==============================
            EXTRACTED RESUME TEXT
        ============================== */}

        {resumeText && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">

            <h3 className="text-xl font-bold mb-4">
              📖 Extracted Resume Text
            </h3>

            <textarea
              value={resumeText}
              readOnly
              className="w-full h-64 border rounded-xl p-4 bg-gray-50"
            />

          </div>
        )}

        {/* ==============================
            AI ANALYSIS
        ============================== */}

        {analysis && (
          <div className="mt-8">

            <h2 className="text-3xl font-bold mb-6">
              📊 Resume Analysis
            </h2>

            {/* ==============================
                ATS SCORE
            ============================== */}

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">

              <p className="text-gray-500 text-lg">
                ATS Score
              </p>

              <p className="text-6xl font-bold text-blue-600 mt-2">
                {analysis.score}/100
              </p>

              {analysis.summary && (
                <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                  {analysis.summary}
                </p>
              )}

            </div>

            {/* ==============================
                STRENGTHS + MISSING SKILLS
            ============================== */}

            <div className="grid md:grid-cols-2 gap-6">

              {/* STRENGTHS */}

              <div className="bg-white rounded-2xl shadow-lg p-6">

                <h3 className="text-xl font-bold mb-4">
                  ✅ Strengths
                </h3>

                {analysis.strengths &&
                analysis.strengths.length > 0 ? (
                  <ul className="space-y-3">

                    {analysis.strengths.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="text-gray-700"
                        >
                          • {item}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="text-gray-500">
                    No strengths returned.
                  </p>
                )}

              </div>

              {/* MISSING SKILLS */}

              <div className="bg-white rounded-2xl shadow-lg p-6">

                <h3 className="text-xl font-bold mb-4">
                  ⚠️ Missing Skills
                </h3>

                {analysis.missingSkills &&
                analysis.missingSkills.length > 0 ? (
                  <ul className="space-y-3">

                    {analysis.missingSkills.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="text-gray-700"
                        >
                          • {item}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="text-green-600">
                    No major missing skills detected.
                  </p>
                )}

              </div>

            </div>

            {/* ==============================
                SUGGESTIONS
            ============================== */}

            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">

              <h3 className="text-xl font-bold mb-4">
                💡 Suggestions
              </h3>

              {analysis.suggestions &&
              analysis.suggestions.length > 0 ? (
                <ul className="space-y-3">

                  {analysis.suggestions.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="text-gray-700"
                      >
                        • {item}
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="text-gray-500">
                  No suggestions returned.
                </p>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default Dashboard;