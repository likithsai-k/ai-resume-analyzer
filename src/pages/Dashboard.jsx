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
  const [loading, setLoading] = useState(false);

  // --------------------------------
  // PDF UPLOAD + TEXT EXTRACTION
  // --------------------------------
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

        text +=
          content.items
            .map((item) => item.str)
            .join(" ") + "\n";
      }

      setResumeText(text);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Could not read this PDF.");
    }
  };

  // --------------------------------
  // REAL AI ANALYSIS
  // --------------------------------
  const analyzeResume = async () => {
    if (!resumeText) {
      alert("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    try {
      setLoading(true);
      setAnalysis(null);

      const response = await fetch(
  "https://ai-resume-analyzer-api-g81v.onrender.com/api/analyze",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resumeText,
      jobDescription,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Analysis failed"
        );
      }

      console.log("AI Analysis:", data);

      setAnalysis(data);
    } catch (error) {
      console.error("Analysis error:", error);

      alert(
        "Could not analyze the resume. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =========================
          NAVBAR
      ========================== */}
      <nav className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">

          <h1 className="text-2xl font-bold">
            AI Resume Analyzer
          </h1>

          <span className="text-sm">
            AI-Powered ATS Analysis
          </span>

        </div>
      </nav>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="max-w-6xl mx-auto p-8">

        <h2 className="text-3xl font-bold mb-2">
          Resume Analysis Dashboard
        </h2>

        <p className="text-gray-600 mb-8">
          Upload your resume and compare it with a job description.
        </p>

        {/* =========================
            RESUME UPLOAD
        ========================== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          <h3 className="text-xl font-bold mb-4">
            📄 Upload Resume
          </h3>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-xl p-3"
          />

          {selectedFile && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">

              <p className="text-green-700 font-semibold">
                ✅ {selectedFile.name}
              </p>

              {resumeText && (
                <p className="text-sm text-green-600 mt-1">
                  Resume text extracted successfully.
                </p>
              )}

            </div>
          )}

        </div>

        {/* =========================
            JOB DESCRIPTION
        ========================== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          <h3 className="text-xl font-bold mb-4">
            💼 Job Description
          </h3>

          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder="Paste the job description here..."
            className="w-full h-56 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <p className="text-sm text-gray-500 mt-2">
            Paste the complete job description for better AI analysis.
          </p>

        </div>

        {/* =========================
            ANALYZE BUTTON
        ========================== */}
        <button
          onClick={analyzeResume}
          disabled={loading}
          className={`px-8 py-3 rounded-xl shadow font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "🤖 AI is analyzing..."
            : "🤖 Analyze Resume"}
        </button>

        {/* =========================
            EXTRACTED TEXT
        ========================== */}
        {resumeText && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">

            <h3 className="text-xl font-bold mb-4">
              📖 Extracted Resume Text
            </h3>

            <textarea
              value={resumeText}
              readOnly
              className="w-full h-64 border rounded-xl p-4 bg-gray-50 text-sm"
            />

          </div>
        )}

        {/* =========================
            LOADING MESSAGE
        ========================== */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">

            <div className="flex items-center gap-3">

              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>

              <p className="text-blue-700 font-semibold">
                Gemini AI is analyzing your resume against the job description...
              </p>

            </div>

            <p className="text-sm text-blue-600 mt-2">
              This may take a few seconds.
            </p>

          </div>
        )}

        {/* =========================
            AI ANALYSIS RESULTS
        ========================== */}
        {analysis && !loading && (
          <div className="mt-10">

            <h2 className="text-3xl font-bold mb-6">
              📊 AI Resume Analysis
            </h2>

            {/* =========================
                ATS SCORE
            ========================== */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">

              <p className="text-gray-500 text-lg">
                ATS Compatibility Score
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

            {/* =========================
                STRENGTHS
            ========================== */}
            <div className="grid md:grid-cols-2 gap-6">

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
                          className="bg-green-50 border border-green-100 rounded-lg p-3"
                        >
                          ✓ {item}
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

              {/* =========================
                  MISSING SKILLS
              ========================== */}
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
                          className="bg-red-50 border border-red-100 rounded-lg p-3"
                        >
                          • {item}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="text-green-600 font-semibold">
                    🎉 No major missing skills identified.
                  </p>
                )}

              </div>

            </div>

            {/* =========================
                SUGGESTIONS
            ========================== */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">

              <h3 className="text-xl font-bold mb-4">
                💡 AI Suggestions
              </h3>

              {analysis.suggestions &&
              analysis.suggestions.length > 0 ? (
                <ul className="space-y-3">

                  {analysis.suggestions.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                      >
                        💡 {item}
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