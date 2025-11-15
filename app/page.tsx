"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home as HomeIcon } from "lucide-react";

export default function Home() {
  const [householdCode, setHouseholdCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoinHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!householdCode.trim()) {
      setError("Please enter a household code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: householdCode.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to join household");
      }

      // Navigate to the household page
      router.push(`/house/${householdCode.trim()}`);
    } catch (err) {
      setError("Failed to join household. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 text-white mb-4">
            <HomeIcon size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Houseboard
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Stay connected with your housemates
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleJoinHouse} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Household Code
              </label>
              <input
                id="code"
                type="text"
                value={householdCode}
                onChange={(e) => setHouseholdCode(e.target.value)}
                placeholder="Enter your house code"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Enter House"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 text-center">
              Don&apos;t have a code?{" "}
              <span className="text-indigo-600 font-medium">
                Just create one above!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
