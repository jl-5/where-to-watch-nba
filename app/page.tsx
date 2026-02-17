"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import dayjs from "dayjs";

interface Game {
  day?: string;
  date?: string;
  team1?: string;
  team2?: string;
  local?: string;
  et?: string;
  tv?: string;
  notes?: string;
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [hidePast, setHidePast] = useState(true); // default ON
  const today = dayjs();

  useEffect(() => {
    fetch("/nba_2025_26_national_tv_schedule.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse<Game>(text, { header: true }).data;
        setGames(parsed);
      });
  }, []);

  const parseDate = (d?: string) => {
    if (!d) return null;
    try {
      return dayjs(d, "MM/DD/YY");
    } catch {
      return null;
    }
  };

  const visibleGames = games.filter((g) => {
    const date = parseDate(g.date);
    if (!date) return false;
    return hidePast ? date.isSame(today, "day") || date.isAfter(today, "day") : true;
  });

  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0 text-center sm:text-left">
          Where to Watch NBA Games in '25–'26
        </h1>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">Hide previous dates</span>
          <button
            onClick={() => setHidePast((prev) => !prev)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              hidePast ? "bg-yellow-400" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                hidePast ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Day</th>
            <th className="p-2">Matchup</th>
            <th className="p-2">Time (EST)</th>
            <th className="p-2">Network</th>
          </tr>
        </thead>
        <tbody>
          {visibleGames.map((g, i) => {
            const gameDate = parseDate(g.date);
            const isToday = gameDate?.isSame(today, "day");
            return (
              <tr
                key={i}
                className={
                  isToday
                    ? "bg-yellow-200 text-black font-semibold"
                    : i % 2 === 0
                    ? "bg-gray-800"
                    : "bg-gray-700"
                }
              >
                <td className="p-2">{g.date}</td>
                <td className="p-2">{g.day}</td>
                <td className="p-2">{`${g.team1} vs ${g.team2}`}</td>
                <td className="p-2">{g.et}</td>
                <td className="p-2">{g.tv}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
