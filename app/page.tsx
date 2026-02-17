"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Papa from "papaparse";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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
  Utah: "utah",
  Washington: "wsh",
};

const getLogoUrl = (team?: string) => {
  if (!team) return null;
  const abbr = TEAM_ABBR[team];
  if (!abbr) return null;
  return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`;
};

const TIME_ZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", short: "ET" },
  { value: "America/Chicago", label: "Central Time (CT)", short: "CT" },
  { value: "America/Denver", label: "Mountain Time (MT)", short: "MT" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", short: "PT" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", short: "AKT" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)", short: "HT" },
  { value: "UTC", label: "UTC", short: "UTC" },
];

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [hidePast, setHidePast] = useState(true); // default ON
  const [darkMode, setDarkMode] = useState(false); // default OFF
  const [teamFilter, setTeamFilter] = useState("All teams");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York");
  const [isReady, setIsReady] = useState(false);
  const today = dayjs();

  useEffect(() => {
    fetch("/nba_2025_26_national_tv_schedule.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, { header: true }).data as Game[];
        setGames(parsed);
      });
  }, []);


  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const parseDate = (d?: string) => {
    if (!d) return null;
    const parsed = dayjs(d, "M/D/YY", true);
    return parsed.isValid() ? parsed : null;
  };

  const parseEtDateTime = (date?: string, et?: string) => {
    if (!date || !et) return null;
    const parsed = dayjs.tz(`${date} ${et}`, "M/D/YY h:mm A", "America/New_York");
    return parsed.isValid() ? parsed : null;
  };

  const formatGameTime = (g: Game) => {
    const etDateTime = parseEtDateTime(g.date, g.et);
    if (!etDateTime) return g.et ?? "";
    const zoned = etDateTime.tz(selectedTimeZone);
    const tzPart = new Intl.DateTimeFormat("en-US", {
      timeZone: selectedTimeZone,
      timeZoneName: "short",
    })
      .formatToParts(zoned.toDate())
      .find((p) => p.type === "timeZoneName")?.value;
    return `${zoned.format("h:mm A")} ${tzPart ?? ""}`.trim();
  };

  const visibleGames = games.filter((g) => {
    const date = parseDate(g.date);
    if (!date) return false;
    return hidePast ? date.isSame(today, "day") || date.isAfter(today, "day") : true;
  });
  const todayGames = games.filter((g) => parseDate(g.date)?.isSame(today, "day"));
  const teamOptions = Array.from(
    new Set(
      games
        .flatMap((g) => [g.team1, g.team2])
        .filter((team): team is string => Boolean(team))
    )
  ).sort((a, b) => a.localeCompare(b));
  const networkOptions = Array.from(
    new Set(games.map((g) => g.tv).filter((network): network is string => Boolean(network)))
  ).sort((a, b) => a.localeCompare(b));
  const filteredGames = visibleGames.filter((g) => {
    const normalizedTeamFilter = teamFilter.trim().toLowerCase();
    const matchesTeam =
      !normalizedTeamFilter ||
      normalizedTeamFilter === "all teams" ||
      g.team1?.toLowerCase().includes(normalizedTeamFilter) ||
      g.team2?.toLowerCase().includes(normalizedTeamFilter);
    const matchesNetwork = networkFilter === "All" || g.tv === networkFilter;
    return matchesTeam && matchesNetwork;
  });
  const selectedZoneLabel = TIME_ZONES.find((zone) => zone.value === selectedTimeZone)?.short ?? "ET";
  const teamSelectValue =
    teamFilter === "All teams" || teamOptions.includes(teamFilter) ? teamFilter : "All teams";
  const panelClass = darkMode
    ? "rounded-2xl border border-slate-700/80 bg-slate-800/80 shadow-xl shadow-slate-950/20 backdrop-blur-sm"
    : "rounded-2xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-300/30 backdrop-blur-sm";
  const inputClass = darkMode
    ? "rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
    : "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";
  const subTextClass = darkMode ? "text-slate-300" : "text-slate-600";

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden p-6 font-sans transition-colors duration-300 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-40 -left-24 h-96 w-96 rounded-full blur-3xl ${
            darkMode ? "bg-sky-900/30" : "bg-sky-200/70"
          }`}
        />
        <div
          className={`absolute top-40 -right-24 h-96 w-96 rounded-full blur-3xl ${
            darkMode ? "bg-indigo-900/30" : "bg-indigo-200/70"
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-5">
        <div
          className={`${panelClass} p-5 transition-all duration-700 ease-out ${
            isReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Where to Watch NBA Games in &apos;25-&apos;26
              </h1>
              <p className={`mt-1 text-sm ${subTextClass}`}>
                National TV schedule browser with live filters, logos, and time zone conversion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center gap-3 rounded-full border px-3 py-1.5 ${
                  darkMode ? "border-slate-600 bg-slate-900/70" : "border-slate-300 bg-white"
                }`}
              >
                <span className={`text-sm ${subTextClass}`}>Dark mode</span>
                <button
                  onClick={() => setDarkMode((prev) => !prev)}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${
                    darkMode ? "bg-sky-500" : "bg-slate-300"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                      darkMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div
                className={`flex items-center gap-3 rounded-full border px-3 py-1.5 ${
                  darkMode ? "border-slate-600 bg-slate-900/70" : "border-slate-300 bg-white"
                }`}
              >
                <span className={`text-sm ${subTextClass}`}>Hide previous dates</span>
                <button
                  onClick={() => setHidePast((prev) => !prev)}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${
                    hidePast ? "bg-sky-500" : "bg-slate-300"
                  }`}
                  aria-label="Toggle hide previous dates"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                      hidePast ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <section
          className={`${panelClass} p-4 sm:p-5 transition-all duration-700 ease-out ${
            isReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "80ms" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Today&apos;s Games</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-700"
              }`}
            >
              {todayGames.length} game{todayGames.length === 1 ? "" : "s"}
            </span>
          </div>
        {todayGames.length === 0 ? (
          <p className={`text-lg font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
            No nationally-televised games today
          </p>
        ) : (
          <div className="grid gap-3">
            {todayGames.map((g, i) => {
              const team1Logo = getLogoUrl(g.team1);
              const team2Logo = getLogoUrl(g.team2);
              return (
                <div
                  key={`${g.date}-${g.team1}-${g.team2}-${i}`}
                  className={`rounded-xl border p-3 sm:p-4 transition-all duration-500 ease-out ${
                    isReady ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  } ${
                    darkMode ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-slate-50"
                  }`}
                  style={{ transitionDelay: `${120 + i * 50}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-bold">
                    {team1Logo && (
                      <Image
                        src={team1Logo}
                        alt={`${g.team1} logo`}
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                      />
                    )}
                    <span>{g.team1}</span>
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>at</span>
                    {team2Logo && (
                      <Image
                        src={team2Logo}
                        alt={`${g.team2} logo`}
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                      />
                    )}
                    <span>{g.team2}</span>
                  </div>
                  <p className={`mt-1 text-base ${subTextClass}`}>
                    {formatGameTime(g)} on {g.tv}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        </section>

        <section
          className={`${panelClass} p-4 transition-all duration-700 ease-out ${
            isReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "140ms" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">Filters</h3>
            <span className={`text-sm font-medium ${subTextClass}`}>
              Showing {filteredGames.length} game{filteredGames.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="team-filter" className={`text-sm font-medium ${subTextClass}`}>
                Team
              </label>
              <div className="flex gap-2">
                <input
                  id="team-filter"
                  list="team-options"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  placeholder="Type to filter teams"
                  className={`flex-1 ${inputClass} ${
                    darkMode ? "placeholder:text-slate-400" : "placeholder:text-slate-500"
                  }`}
                />
                <select
                  value={teamSelectValue}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className={`w-40 ${inputClass}`}
                  aria-label="Select team filter"
                >
                  <option value="All teams">All teams</option>
                  {teamOptions.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
              <datalist id="team-options">
                <option value="All teams" />
                {teamOptions.map((team) => (
                  <option key={team} value={team} />
                ))}
              </datalist>
            </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="network-filter"
              className={`text-sm font-medium ${subTextClass}`}
            >
              Network
            </label>
            <select
              id="network-filter"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className={inputClass}
            >
              <option value="All">All networks</option>
              {networkOptions.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="timezone-filter"
              className={`text-sm font-medium ${subTextClass}`}
            >
              Time zone
            </label>
            <select
              id="timezone-filter"
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className={inputClass}
            >
              {TIME_ZONES.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>
          </div>
        </section>

        <section
          className={`${panelClass} overflow-hidden transition-all duration-700 ease-out ${
            isReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead
                className={`sticky top-0 z-10 ${
                  darkMode ? "bg-slate-800/95 text-slate-200" : "bg-slate-200/95 text-slate-700"
                }`}
              >
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Day</th>
                  <th className="p-3 text-left">Matchup</th>
                  <th className="p-3 text-left">Time ({selectedZoneLabel})</th>
                  <th className="p-3 text-left">Network</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((g, i) => {
            const gameDate = parseDate(g.date);
            const isToday = gameDate?.isSame(today, "day");
            const team1Logo = getLogoUrl(g.team1);
            const team2Logo = getLogoUrl(g.team2);
            return (
              <tr
                key={i}
                className={`transition-all ${
                  isReady ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                } ${
                  isToday
                    ? darkMode
                      ? "bg-sky-900/35 text-sky-200 font-semibold"
                      : "bg-sky-100/80 text-sky-900 font-semibold"
                    : i % 2 === 0
                    ? darkMode
                      ? "bg-slate-900/70"
                      : "bg-white"
                    : darkMode
                    ? "bg-slate-800/70"
                    : "bg-slate-100"
                } ${darkMode ? "hover:bg-slate-700/70" : "hover:bg-slate-200/70"}`}
                style={{
                  transitionDelay: `${Math.min(i * 12, 240)}ms`,
                  transitionDuration: "450ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <td className="p-3">{g.date}</td>
                <td className="p-3">{g.day}</td>
                <td className="p-3">
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
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>at</span>
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
                <td className="p-3">{formatGameTime(g)}</td>
                <td className="p-3">{g.tv}</td>
              </tr>
            );
          })}
                {filteredGames.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`p-6 text-center text-sm ${subTextClass}`}>
                      No games match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
