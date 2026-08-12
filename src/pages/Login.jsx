import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[400px]">

        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-xl mb-6"
        />

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
        >
          Login
        </button>

        <p className="text-center mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;