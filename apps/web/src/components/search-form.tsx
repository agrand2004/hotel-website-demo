import { isoDateFromToday } from "../lib/format";

const DEFAULT_CHECK_IN_OFFSET_DAYS = 14;
const DEFAULT_STAY_NIGHTS = 2;
const MAX_ADULTS = 4;

/** Plain GET form that sends the visitor to the room list of the searched stay. */
export function SearchForm(props: { checkIn?: string; checkOut?: string; adults?: string }) {
  const checkIn = props.checkIn ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS);
  const checkOut = props.checkOut ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS + DEFAULT_STAY_NIGHTS);
  const adults = props.adults ?? "2";
  return (
    <form action="/rooms" method="get" className="grid gap-4 rounded bg-white p-6 shadow sm:grid-cols-4" aria-label="Search rooms">
      <label className="flex flex-col text-sm">
        Check-in
        <input type="date" name="checkIn" defaultValue={checkIn} required className="mt-1 rounded border border-forest/30 p-2" />
      </label>
      <label className="flex flex-col text-sm">
        Check-out
        <input type="date" name="checkOut" defaultValue={checkOut} required className="mt-1 rounded border border-forest/30 p-2" />
      </label>
      <label className="flex flex-col text-sm">
        Adults
        <select name="adults" defaultValue={adults} className="mt-1 rounded border border-forest/30 p-2">
          {Array.from({ length: MAX_ADULTS }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="self-end rounded bg-forest px-4 py-2 text-cream hover:opacity-90">
        Search rooms
      </button>
    </form>
  );
}
