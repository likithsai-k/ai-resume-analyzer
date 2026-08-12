import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          AI Resume Analyzer
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Upload your resume, compare it with a job description, and receive an
          AI-powered ATS score with personalized suggestions.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;