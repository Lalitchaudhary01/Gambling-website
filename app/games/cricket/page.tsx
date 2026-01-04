"use client";

import { useState } from "react";

const OPTIONS = ["1", "2", "3", "4", "6", "WICKET"];

export default function CricketGamePage() {
  const [amount, setAmount] = useState(100);
  const [prediction, setPrediction] = useState("6");

  const [bet, setBet] = useState(null); // active bet
  const [result, setResult] = useState(null); // final result

  const [adminMode] = useState(true); // always ON (local demo)

  function placeBet() {
    setResult(null);

    setBet({
      prediction,
      amount,
      status: "PENDING",
    });
  }

  function adminForce(resultValue) {
    if (!bet) return;

    const isWin = bet.prediction === resultValue;

    setResult({
      result: resultValue,
      isWin,
      winAmount: isWin ? bet.amount * 2 : 0,
      message: "Result set by admin (TEST MODE)",
    });

    setBet(null);
  }

  function adminCancel() {
    if (!bet) return;

    setResult({
      result: "-",
      isWin: false,
      winAmount: 0,
      message: "Bet cancelled by admin (TEST MODE)",
    });

    setBet(null);
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

        {/* Place Bet */}
        {!bet && (
          <button
            onClick={placeBet}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
          >
            Place Bet
          </button>
        )}

        {/* PENDING BET */}
        {bet && (
          <div className="bg-yellow-600/20 p-3 rounded space-y-2">
            <p>⏳ Waiting for result…</p>
            <p>
              Prediction: <b>{bet.prediction}</b>
            </p>
            <p>Amount: ₹{bet.amount}</p>
          </div>
        )}

        {/* ADMIN PANEL */}
        {bet && adminMode && (
          <div className="bg-gray-700 p-3 rounded space-y-2">
            <p className="font-bold text-green-400">ADMIN PANEL (TEST)</p>

            <p>
              User predicted: <b>{bet.prediction}</b>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => adminForce(opt)}
                  className="bg-purple-600 hover:bg-purple-700 p-2 rounded"
                >
                  Force {opt}
                </button>
              ))}
            </div>

            <button
              onClick={adminCancel}
              className="w-full bg-red-600 hover:bg-red-700 p-2 rounded mt-2"
            >
              Cancel Bet
            </button>
          </div>
        )}

        {/* FINAL RESULT */}
        {result && (
          <div className="bg-gray-700 p-3 rounded space-y-1">
            <p>
              🏏 Result: <b>{result.result}</b>
            </p>
            <p>{result.isWin ? "✅ You WON!" : "❌ You LOST"}</p>
            {result.isWin && (
              <p>
                💰 Win Amount: <b>₹{result.winAmount}</b>
              </p>
            )}
            <p className="text-yellow-400 text-sm">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
