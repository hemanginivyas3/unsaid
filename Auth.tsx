import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    try {
      setMessage("");

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("✅ Account created successfully!");
      }
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: 250 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: 250 }}
      />

      <button onClick={handleAuth} style={{ padding: 10, width: 150 }}>
        {isLogin ? "Login" : "Signup"}
      </button>

      <p style={{ marginTop: 10 }}>{message}</p>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: 10, padding: 6 }}
      >
        Switch to {isLogin ? "Signup" : "Login"}
      </button>
    </div>
  );
}
