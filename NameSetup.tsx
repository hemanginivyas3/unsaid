import { useState } from "react";
import { saveUserProfile } from "./userService";

export default function NameSetup({
  uid,
  onDone,
}: {
  uid: string;
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setMsg("Please enter your name 😊");
      return;
    }

    try {
      setLoading(true);
      setMsg("");
      await saveUserProfile(uid, name.trim());
      onDone(name.trim());
    } catch (e: any) {
      setMsg("❌ " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome 💙</h2>
      <p>What should I call you?</p>

      <input
        value={name}
        placeholder="Your name"
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 10, width: 260, marginTop: 10 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave} disabled={loading} style={{ padding: 10 }}>
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
