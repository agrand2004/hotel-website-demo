import { useState } from "react";
import { isoDateFromToday } from "../lib/format";

const DEFAULT_CHECK_IN_OFFSET_DAYS = 14;
const DEFAULT_STAY_NIGHTS = 2;
const MAX_ADULTS = 4;

/** Architectural search console inspired by Lingers boutique booking interface. */
export function SearchForm(props: { checkIn?: string; checkOut?: string; adults?: string }) {
  const [checkIn, setCheckIn] = useState(props.checkIn ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS));
  const [checkOut, setCheckOut] = useState(props.checkOut ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS + DEFAULT_STAY_NIGHTS));
  const nextDay = new Date(`${checkIn}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const earliestDeparture = Number.isNaN(nextDay.getTime()) ? isoDateFromToday(1) : nextDay.toISOString().slice(0, 10);
  const adults = props.adults ?? "2";

  return (
    <form
      action="/rooms"
      method="get"
      className="bg-white border border-[#1F1E1D]/15 shadow-xl shadow-black/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1F1E1D]/10 animate-search-bar"
      aria-label="Search available rooms"
    >
      {/* 1. Arrival */}
      <label className="flex flex-col justify-center px-6 py-4 hover:bg-[#FAF8F5] transition-colors duration-200 cursor-pointer group">
        <span className="font-brand text-xs uppercase tracking-[0.22em] font-medium text-[#6E5339] group-hover:text-[#1F1E1D] transition-colors">
          Arrival
        </span>
        <input
          type="date"
          name="checkIn"
          value={checkIn}
          min={isoDateFromToday(0)}
          onChange={(event) => {
            const value = event.target.value;
            setCheckIn(value);
            if (value && value >= checkOut) {
              const departure = new Date(`${value}T00:00:00Z`);
              departure.setUTCDate(departure.getUTCDate() + 1);
              setCheckOut(departure.toISOString().slice(0, 10));
            }
          }}
          required
          className="w-full bg-transparent text-sm font-medium text-[#1F1E1D] focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer mt-1"
        />
      </label>

      {/* 2. Departure */}
      <label className="flex flex-col justify-center px-6 py-4 hover:bg-[#FAF8F5] transition-colors duration-200 cursor-pointer group">
        <span className="font-brand text-xs uppercase tracking-[0.22em] font-medium text-[#6E5339] group-hover:text-[#1F1E1D] transition-colors">
          Departure
        </span>
        <input
          type="date"
          name="checkOut"
          value={checkOut}
          min={earliestDeparture}
          onChange={(event) => setCheckOut(event.target.value)}
          required
          className="w-full bg-transparent text-sm font-medium text-[#1F1E1D] focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer mt-1"
        />
      </label>

      {/* 3. Guests */}
      <label className="flex flex-col justify-center px-6 py-4 hover:bg-[#FAF8F5] transition-colors duration-200 cursor-pointer group">
        <span className="font-brand text-xs uppercase tracking-[0.22em] font-medium text-[#6E5339] group-hover:text-[#1F1E1D] transition-colors">
          Guests
        </span>
        <select
          name="adults"
          defaultValue={adults}
          className="w-full bg-transparent text-sm font-medium text-[#1F1E1D] focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer mt-1"
        >
          {Array.from({ length: MAX_ADULTS }, (_, index) => (
            <option key={index + 1} value={index + 1} className="bg-white text-[#1F1E1D]">
              {index + 1} {index === 0 ? "Guest (Solo)" : "Guests"}
            </option>
          ))}
        </select>
      </label>

      {/* 4. Action Button */}
      <div className="w-full flex items-stretch">
        <button
          type="submit"
          className="w-full bg-[#1F1E1D] hover:bg-[#6E5339] text-[#FAF8F5] px-6 py-5 text-xs uppercase tracking-[0.24em] font-medium flex items-center justify-center gap-3 transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1E1D]"
        >
          <span>Check Availability</span>
          <span aria-hidden="true" className="text-sm">→</span>
        </button>
      </div>
    </form>
  );
}
