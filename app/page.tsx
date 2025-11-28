"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home as HomeIcon, Plus } from "lucide-react";
import { CreateHouseModal } from "@/components/CreateHouseModal";

export default function Home() {
  const [houseName, setHouseName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const handleJoinHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!houseName.trim()) {
      setError("Please enter a house name");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: houseName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to join household");
      }

      // Navigate to the household page
      router.push(`/house/${houseName.trim()}`);
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
            Roomie Radar
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Stay connected with your roommates
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleJoinHouse} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                House Name
              </label>
                <input
                  id="name"
                  type="text"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="Enter your house name"
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
            <p className="text-sm text-slate-600 text-center mb-4">
              Don&apos;t have a code?
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-indigo-500 text-indigo-600 py-3 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Create New House
            </button>
          </div>
        </div>
      </div>
      
      <CreateHouseModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
