import { type KeyboardEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { addDays, isCalendarDate } from "../lib/calendar-dates";
import { formatDate, isoDateFromToday } from "../lib/format";
import { DateCalendar } from "./date-calendar";
import "./search-form.css";

type Picker = "checkIn" | "checkOut" | "adults";
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const MAX_ADULTS = 4;

function Chevron() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.25" /></svg>;
}

export function SearchForm(props: { checkIn?: string; checkOut?: string; adults?: string }) {
  const today = isoDateFromToday(0);
  const [checkIn, setCheckIn] = useState(() => isCalendarDate(props.checkIn) && props.checkIn >= today ? props.checkIn : addDays(today, 14));
  const [checkOut, setCheckOut] = useState(() => isCalendarDate(props.checkOut) && props.checkOut > checkIn ? props.checkOut : addDays(checkIn, 2));
  const [adults, setAdults] = useState(() => {
    const count = Number(props.adults ?? 2);
    return Number.isInteger(count) && count >= 1 && count <= MAX_ADULTS ? count : 2;
  });
  const [picker, setPicker] = useState<Picker | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogId = useId();
  const titleId = useId();

  useLayoutEffect(() => {
    if (!picker) return;
    const dialog = dialogRef.current!;
    const trigger = triggerRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    dialog.showModal();

    function position() {
      if (!trigger) return;
      const anchor = trigger.getBoundingClientRect();
      const panel = dialog.getBoundingClientRect();
      const left = Math.max(12, Math.min(anchor.left, innerWidth - panel.width - 12));
      let top = anchor.bottom + 8;
      if (top + panel.height > innerHeight - 12) top = Math.max(12, anchor.top - panel.height - 8);
      dialog.style.setProperty("--picker-left", `${left}px`);
      dialog.style.setProperty("--picker-top", `${top}px`);
    }
    position();
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("resize", position);
      dialog.close();
      root.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [picker]);

  function openPicker(field: Picker, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setPicker(field);
  }

  function selectDate(date: string) {
    if (picker === "checkIn") {
      setCheckIn(date);
      if (date >= checkOut) setCheckOut(addDays(date, 1));
    } else {
      setCheckOut(date);
    }
    setPicker(null);
  }

  function moveGuestFocus(event: KeyboardEvent<HTMLButtonElement>, guest: number) {
    let next: number;
    switch (event.key) {
      case "ArrowDown": case "ArrowRight": next = guest % MAX_ADULTS + 1; break;
      case "ArrowUp": case "ArrowLeft": next = (guest + MAX_ADULTS - 2) % MAX_ADULTS + 1; break;
      case "Home": next = 1; break;
      case "End": next = MAX_ADULTS; break;
      default: return;
    }
    event.preventDefault();
    dialogRef.current?.querySelector<HTMLButtonElement>(`[data-guests="${next}"]`)?.focus();
  }

  function keepFocusInPicker(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const stops = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")].filter((button) => button.tabIndex >= 0);
    const current = stops.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.shiftKey ? (current <= 0 ? stops.length - 1 : current - 1) : (current + 1) % stops.length;
    event.preventDefault();
    stops[next]?.focus();
  }

  return (
    <form action="/rooms" method="get" className="stay-form" aria-label="Search available rooms" data-ui>
      {/* Preserve the named native fields for form submission and site analysis. */}
      <input hidden type="date" name="checkIn" value={checkIn} min={today} readOnly />
      <input hidden type="date" name="checkOut" value={checkOut} min={addDays(checkIn, 1)} readOnly />
      <select hidden name="adults" value={adults} onChange={(event) => setAdults(Number(event.target.value))} aria-label="Number of guests">
        {Array.from({ length: MAX_ADULTS }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
      </select>

      {(["checkIn", "checkOut"] as const).map((field) => {
        const date = field === "checkIn" ? checkIn : checkOut;
        const label = field === "checkIn" ? "Arrival" : "Departure";
        return (
          <button key={field} type="button" className="stay-field" aria-label={`${label}, ${formatDate(date)}`} aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={picker === field} onClick={(event) => openPicker(field, event.currentTarget)}>
            <span className="stay-field-label">{label}</span><Chevron />
            <span className="stay-field-value">{SHORT_DATE.format(new Date(`${date}T00:00:00Z`))}<small>{date.slice(0, 4)}</small></span>
          </button>
        );
      })}
      <button type="button" className="stay-field stay-guests" aria-label={`Guests, ${adults} ${adults === 1 ? "guest" : "guests"}`} aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={picker === "adults"} onClick={(event) => openPicker("adults", event.currentTarget)}>
        <span className="stay-field-label">Guests</span><Chevron />
        <span className="stay-field-value">{adults} {adults === 1 ? "guest" : "guests"}</span>
      </button>
      <button type="submit" className="stay-search-submit"><span>Check availability</span><span aria-hidden="true">↗</span></button>

      <dialog ref={dialogRef} id={dialogId} className={`stay-picker${picker === "adults" ? " guest-picker" : ""}`} aria-labelledby={titleId} data-lenis-prevent onKeyDown={keepFocusInPicker} onCancel={(event) => { event.preventDefault(); setPicker(null); }} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setPicker(null);
      }}>
        {picker && <>
          <div className="picker-heading">
            <h2 id={titleId}>{picker === "adults" ? "Your guests" : picker === "checkIn" ? "Your arrival" : "Your departure"}</h2>
            <button type="button" className="picker-icon-button" aria-label="Close picker" onClick={() => setPicker(null)}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.25" /></svg></button>
          </div>
          <div className="picker-body">{picker === "adults" ? (
            <div role="listbox" aria-label="Number of guests" className="guest-options">
              {Array.from({ length: MAX_ADULTS }, (_, index) => index + 1).map((guest) => (
                <button key={guest} type="button" role="option" aria-selected={guest === adults} tabIndex={guest === adults ? 0 : -1} data-autofocus={guest === adults || undefined} data-guests={guest} onKeyDown={(event) => moveGuestFocus(event, guest)} onClick={() => { setAdults(guest); setPicker(null); }}>
                  <span>{guest} {guest === 1 ? "guest" : "guests"}</span>
                  {guest === adults && <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m3 9 4 4 8-8" stroke="currentColor" strokeWidth="1.4" /></svg>}
                </button>
              ))}
            </div>
          ) : (
            <DateCalendar key={picker} value={picker === "checkIn" ? checkIn : checkOut} min={picker === "checkIn" ? today : addDays(checkIn, 1)} today={today} checkIn={checkIn} checkOut={checkOut} onSelect={selectDate} />
          )}</div>
        </>}
      </dialog>
    </form>
  );
}
