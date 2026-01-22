import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("❌ Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("✅ Account created successfully!");
      }
    } catch (err: any) {
      setMessage("❌ " + (err?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aura-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-xl">
        <div className="mb-6">
          <h2 className="text-3xl font-serif text-aura-900 italic">
            {isLogin ? "Welcome back 💙" : "Join Unsaid ✨"}
          </h2>
          <p className="mt-2 text-aura-500 font-serif text-lg">
            {isLogin
              ? "Log in to continue your quiet space."
              : "Create an account to save your reflections."}
          </p>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border border-aura-200 font-serif text-aura-900 text-lg focus:outline-none focus:ring-2 ring-aura-200"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border border-aura-200 font-serif text-aura-900 text-lg focus:outline-none focus:ring-2 ring-aura-200"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full px-6 py-4 bg-aura-800 text-white rounded-2xl font-bold shadow-lg disabled:opacity-40 hover:bg-aura-900 transition-colors"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </button>

          {message && (
            <p className="text-center text-sm text-aura-500 mt-2">{message}</p>
          )}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="w-full text-aura-500 font-medium hover:text-aura-800 transition-colors"
          >
            Switch to {isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
