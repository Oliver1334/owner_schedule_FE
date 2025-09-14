import React, { useEffect, useState } from "react";
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
import "../CalendarOverrides.css"; // keep overrides for rbc internals

/** ---- Localizer ---- */
const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

/** ---- Status mapping ---- */
const EVENT_STATUS = {
  1: { label: "Pending", color: "#718096" }, // gray
  2: { label: "Confirmed", color: "#38A169" }, // green
  3: { label: "In Progress", color: "#D69E2E" }, // gold
  4: { label: "Completed", color: "#3182CE" }, // blue
  5: { label: "Cancelled", color: "#9F7AEA" }, // purple
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

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    status: "1",
  });

  /** Fetch events from Django backend */
  useEffect(() => {
    async function load() {
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
    }
    load();
  }, []);

  /** Navigation */
  const moveDate = (direction) => {
    const d = new Date(date);
    if (view === Views.MONTH) d.setMonth(d.getMonth() + direction);
    else if (view === Views.WEEK) d.setDate(d.getDate() + 7 * direction);
    else if (view === Views.DAY) d.setDate(d.getDate() + 1 * direction);
    else d.setDate(d.getDate() + 7 * direction);
    setDate(new Date(d));
  };

  /** Slot selection -> open modal */
  const handleSelectSlot = (slotInfo) => {
    setForm({
      title: "",
      start: toDatetimeLocal(slotInfo.start),
      end: toDatetimeLocal(slotInfo.end),
      status: "1",
    });
    setModalOpen(true);
  };

  /** Submit new event */
  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const payload = {
      title: form.title,
      start_time: new Date(form.start).toISOString(),
      end_time: new Date(form.end).toISOString(),
      status: Number(form.status),
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();

      const mapped = {
        id: created.id ?? created.pk,
        title: created.title ?? payload.title,
        start: parseDate(created.start_time ?? created.start ?? payload.start_time),
        end: parseDate(created.end_time ?? created.end ?? payload.end_time),
        status: created.status ?? payload.status,
        raw: created,
      };
      setEvents((prev) => [...prev, mapped]);

      setModalOpen(false);
      setForm({ title: "", start: "", end: "", status: "1" });
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  return (
    <div className="p-5 font-sans">
      {/* Top toolbar */}
      <div className="flex items-center gap-4 mb-4">
        {/* Add Event */}
        <button
          onClick={() => {
            setForm({
              title: "",
              start: toDatetimeLocal(new Date()),
              end: toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
              status: "1",
            });
            setModalOpen(true);
          }}
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
      <div className="h-[75vh] min-h-[500px] border rounded-lg shadow-md p-2">
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
              backgroundColor: EVENT_STATUS[event.status]?.color || EVENT_STATUS[1].color,
              color: "white",
              borderRadius: "0.5rem",
              padding: "2px 6px",
              border: "none",
            },
          })}
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900">Add Event</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="Meeting, Appointment..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                required
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm((s) => ({ ...s, start: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                required
                type="datetime-local"
                value={form.end}
                onChange={(e) => setForm((s) => ({ ...s, end: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                {Object.entries(EVENT_STATUS).map(([k, { label }]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
