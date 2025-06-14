import { useState, FormEvent } from "react";
import { useRouter } from "next/router";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const body = await res.json();
      setError(body.detail || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl mb-4 text-center">Sign Up</h1>

        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

        <label className="block mb-2">
          <span className="block text-sm font-medium">Username</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
