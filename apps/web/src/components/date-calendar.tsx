import { type KeyboardEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { addDays, addMonths, calendarDays, mondayIndex, stayNights } from "../lib/calendar-dates";
import { formatDate } from "../lib/format";

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function DateCalendar({ value, min, today, checkIn, checkOut, onSelect }: {
  value: string; min: string; today: string; checkIn: string; checkOut: string; onSelect: (date: string) => void;
}) {
  const [focusedDate, setFocusedDate] = useState(value < min ? min : value);
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(false);
  const monthId = useId();
  const helpId = useId();
  const days = calendarDays(focusedDate);
  const month = focusedDate.slice(0, 7);

  useLayoutEffect(() => {
    if (shouldFocus.current) {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus();
      shouldFocus.current = false;
    }
  }, [focusedDate]);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    let next: string;
    switch (event.key) {
      case "ArrowLeft": next = addDays(date, -1); break;
      case "ArrowRight": next = addDays(date, 1); break;
      case "ArrowUp": next = addDays(date, -7); break;
      case "ArrowDown": next = addDays(date, 7); break;
      case "Home": next = addDays(date, -mondayIndex(date)); break;
      case "End": next = addDays(date, 6 - mondayIndex(date)); break;
      case "PageUp": next = addMonths(date, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = addMonths(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    if (next < min) next = min;
    if (next === focusedDate) return;
    shouldFocus.current = true;
    setFocusedDate(next);
  }

  const nights = stayNights(checkIn, checkOut);
  return (
    <>
      <div className="calendar-navigation">
        <button type="button" className="picker-icon-button" aria-label="Previous month" disabled={month <= min.slice(0, 7)} onClick={() => setFocusedDate((date) => {
          const previous = addMonths(date, -1);
          // Move focus off the navigation button when it becomes disabled at the first month.
          if (previous.slice(0, 7) <= min.slice(0, 7)) shouldFocus.current = true;
          return previous < min ? min : previous;
        })}><span aria-hidden="true">←</span></button>
        <h3 id={monthId} aria-live="polite" aria-atomic="true">{MONTH.format(new Date(`${focusedDate}T00:00:00Z`))}</h3>
        <button type="button" className="picker-icon-button" aria-label="Next month" onClick={() => setFocusedDate((date) => addMonths(date, 1))}><span aria-hidden="true">→</span></button>
      </div>
      <table ref={gridRef} role="grid" aria-labelledby={monthId} aria-describedby={helpId} className="date-calendar">
        <thead><tr>{WEEKDAYS.map((day) => <th key={day} scope="col" abbr={day}>{day.slice(0, 2)}</th>)}</tr></thead>
        <tbody>{Array.from({ length: 6 }, (_, week) => (
          <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((date) => (
            <td key={date} aria-selected={date === value} data-in-range={date > checkIn && date < checkOut || undefined}>
              <button
                type="button"
                data-date={date}
                data-autofocus={date === focusedDate || undefined}
                data-outside={date.slice(0, 7) !== month || undefined}
                data-endpoint={date === checkIn || date === checkOut || undefined}
                aria-label={formatDate(date)}
                aria-current={date === today ? "date" : undefined}
                disabled={date < min}
                tabIndex={date === focusedDate ? 0 : -1}
                onKeyDown={(event) => handleKey(event, date)}
                onClick={() => onSelect(date)}
              >{Number(date.slice(8))}</button>
            </td>
          ))}</tr>
        ))}</tbody>
      </table>
      <div className="calendar-stay"><span>Your stay</span><strong>{nights} {nights === 1 ? "night" : "nights"}</strong></div>
      <p id={helpId} className="sr-only">Use arrow keys to move between days. Page Up and Page Down change the month. Enter selects a date. Escape closes the calendar.</p>
    </>
  );
}
