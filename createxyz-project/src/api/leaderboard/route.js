// components/GlobalLeaderboard.js
import { useEffect, useState } from "react";

export default function GlobalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/game-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getLeaderboard" }),
        });

        if (!response.ok) throw new Error("Failed to fetch leaderboard");

        const data = await response.json();

        // 🔥 Use the correct key from your backend (coins, not leaderboard)
        setLeaderboard(data.coins || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(0);
  };

  const getRankColor = (index) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-green-500";
    if (index === 2) return "text-blue-500";
    return "text-black";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2ff] via-[#f0f9ff] to-[#dbeafe] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-crimson-text text-[#2d3748] text-center mb-8">
          Global Leaderboard
        </h1>

        {loading ? (
          <div className="text-center text-[#4a5568]">
            Loading leaderboard...
          </div>
        ) : error ? (
          <div className="text-center text-[#EF4444]">{error}</div>
        ) : (
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className="flex items-center justify-between p-4 bg-white/20 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-2xl font-bold w-8 ${getRankColor(
                        index
                      )}`}
                    >
                      {index + 1}.
                    </span>
                    <span className="text-lg text-[#4a5568] font-medium">
                      {entry.profile_name || "Player"} ({entry.user_id})
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[#2d3748]">
                    {formatNumber(entry.total_coins_earned)} coins
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center text-[#4a5568]">
                  No entries yet. Start playing to get on the leaderboard!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}