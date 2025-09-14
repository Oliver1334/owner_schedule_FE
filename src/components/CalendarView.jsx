import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek as dfStartOfWeek,
  getDay,
  parseISO,
} from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../CalendarOverrides.css";
import EventsForm from "../features/events/EventsForm";

/** ---- Localizer ---- */
const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

/** ---- Status mapping (for event coloring) ---- */
const EVENT_STATUS = {
  1: { label: "Pending", color: "#718096" },
  2: { label: "Confirmed", color: "#38A169" },
  3: { label: "In Progress", color: "#D69E2E" },
  4: { label: "Completed", color: "#3182CE" },
  5: { label: "Cancelled", color: "#9F7AEA" },
};

/** ---- Helpers ---- */
const parseDate = (d) => (typeof d === "string" ? parseISO(d) : new Date(d));
const toDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function UserCalendar() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);

  // control EventsForm modal
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);

  /** Fetch events from Django backend */
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      const mapped = data.map((e) => ({
        id: e.id ?? e.pk,
        title: e.title ?? e.name ?? "Event",
        start: parseDate(e.start_time ?? e.start),
        end: parseDate(e.end_time ?? e.end),
        status: e.status ?? 1,
        raw: e,
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /** Navigation */
  const moveDate = (direction) => {
    const d = new Date(date);
    if (view === Views.MONTH) d.setMonth(d.getMonth() + direction);
    else if (view === Views.WEEK) d.setDate(d.getDate() + 7 * direction);
    else if (view === Views.DAY) d.setDate(d.getDate() + 1 * direction);
    else d.setDate(d.getDate() + 7 * direction);
    setDate(new Date(d));
  };

  /** Toolbar Add Event -> open EventsForm */
  const openBlankForm = () => {
    setPrefill({
      startTime: toDatetimeLocal(new Date()),
      endTime: toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
      eventType: "MEETING",
    });
    setModalOpen(true);
  };

  /** Slot selection -> open EventsForm with prefilled start/end */
  const handleSelectSlot = (slotInfo) => {
    setPrefill({
      startTime: toDatetimeLocal(slotInfo.start),
      endTime: toDatetimeLocal(slotInfo.end),
      eventType: "MEETING",
    });
    setModalOpen(true);
  };

  return (
    <div className="p-5 font-sans">
      {/* Top toolbar */}
      <div className="flex items-center gap-4 mb-4">
        {/* Keep YOUR existing Add Event button; it now opens EventsForm */}
        <button
          onClick={openBlankForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Add Event
        </button>

        {/* Status legend */}
        <div className="flex gap-2">
          {Object.entries(EVENT_STATUS).map(([status, { label, color }]) => (
            <div
              key={status}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-white text-sm font-medium"
              style={{ background: color }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Navigation + view buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => moveDate(-1)}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
          >
            ◀
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={() => moveDate(1)}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
          >
            ▶
          </button>

          <div className="w-4" />

          {[
            { key: Views.MONTH, label: "Month" },
            { key: Views.WEEK, label: "Week" },
            { key: Views.DAY, label: "Day" },
            { key: Views.AGENDA, label: "Agenda" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setView(b.key)}
              className={`px-3 py-1 rounded-md border ${
                view === b.key
                  ? "border-blue-600 bg-blue-50 font-semibold"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="h-[75vh] min-h-[500px] border rounded-xl shadow-lg bg-white p-3">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          view={view}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(d) => setDate(d)}
          onSelectSlot={handleSelectSlot}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor:
                EVENT_STATUS[event.status]?.color || EVENT_STATUS[1].color,
              color: "white",
              borderRadius: "0.75rem",
              padding: "4px 8px",
              border: "none",
              fontWeight: "600",
            },
          })}
        />
      </div>

      {/* Shared EventsForm modal (controlled here) */}
      <EventsForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          // after closing, refresh to reflect any new items
          fetchEvents();
        }}
        prefill={prefill}
        onSaved={() => {
          // if the Redux action completes, ensure UI is fresh
          fetchEvents();
        }}
      />
    </div>
  );
}
