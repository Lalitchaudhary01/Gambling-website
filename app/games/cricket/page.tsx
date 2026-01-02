"use client";

import { useState } from "react";

const OPTIONS = ["1", "2", "3", "4", "6", "WICKET"];

export default function CricketGamePage() {
  const [amount, setAmount] = useState(100);
  const [prediction, setPrediction] = useState<string>("6");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function placeBet() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/bets/cricket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount,
          prediction,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">🏏 Cricket Betting</h1>

        {/* Prediction */}
        <div>
          <p className="mb-2 font-semibold">Predict next ball:</p>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setPrediction(opt)}
                className={`p-2 rounded ${
                  prediction === opt
                    ? "bg-green-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1 font-semibold">Bet Amount</label>
          <input
            type="number"
            value={amount}
            min={10}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 outline-none"
          />
        </div>

        {/* Bet Button */}
        <button
          onClick={placeBet}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-600/20 text-red-400 p-2 rounded">
            ❌ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-gray-700 p-3 rounded space-y-1">
            <p>
              🎯 Prediction: <b>{prediction}</b>
            </p>
            <p>
              🏏 Result: <b>{result.result}</b>
            </p>
            <p>{result.isWin ? "✅ You WON!" : "❌ You LOST"}</p>
            {result.isWin && (
              <p>
                💰 Win Amount: <b>₹{result.winAmount}</b>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
