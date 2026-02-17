"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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

const TEAM_ABBR: Record<string, string> = {
  Atlanta: "atl",
  Boston: "bos",
  Brooklyn: "bkn",
  Charlotte: "cha",
  Chicago: "chi",
  Cleveland: "cle",
  Dallas: "dal",
  Denver: "den",
  Detroit: "det",
  "Golden State": "gs",
  Houston: "hou",
  Indiana: "ind",
  "L.A. Lakers": "lal",
  "LA Clippers": "lac",
  Memphis: "mem",
  Miami: "mia",
  Milwaukee: "mil",
  Minnesota: "min",
  "New Orleans": "no",
  "New York": "ny",
  "Oklahoma City": "okc",
  Orlando: "orl",
  Philadelphia: "phi",
  Phoenix: "phx",
  Portland: "por",
  Sacramento: "sac",
  "San Antonio": "sa",
  Toronto: "tor",
  Utah: "uta",
  Washington: "wsh",
};

const getLogoUrl = (team?: string) => {
  if (!team) return null;
  const abbr = TEAM_ABBR[team];
  if (!abbr) return null;
  return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`;
};

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
    <main className="p-6 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0 text-center sm:text-left">
          Where to Watch NBA Games in &apos;25-&apos;26
        </h1>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Hide previous dates</span>
          <button
            onClick={() => setHidePast((prev) => !prev)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              hidePast ? "bg-sky-500" : "bg-slate-300"
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

      <table className="w-full border-collapse text-sm shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-slate-200 text-slate-700">
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
            const team1Logo = getLogoUrl(g.team1);
            const team2Logo = getLogoUrl(g.team2);
            return (
              <tr
                key={i}
                className={
                  isToday
                    ? "bg-sky-100 text-sky-900 font-semibold"
                    : i % 2 === 0
                    ? "bg-white"
                    : "bg-slate-100"
                }
              >
                <td className="p-2">{g.date}</td>
                <td className="p-2">{g.day}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {team1Logo && (
                      <Image
                        src={team1Logo}
                        alt={`${g.team1} logo`}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    )}
                    <span>{g.team1}</span>
                    <span className="text-slate-500">vs</span>
                    {team2Logo && (
                      <Image
                        src={team2Logo}
                        alt={`${g.team2} logo`}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    )}
                    <span>{g.team2}</span>
                  </div>
                </td>
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
