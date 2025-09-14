import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "react-modal";
import { createEvent, updateEvent } from "./eventsSlice";
import { FaUsers, FaUserPlus, FaChartBar, FaCalendarAlt } from "react-icons/fa";
Modal.setAppElement("#root");

const EVENT_TYPES = [
  {
    key: "MEETING",
    label: "Meeting",
    icon: <FaUsers size={20} />, 
    color: "bg-blue-100 text-blue-600",
  },
  {
    key: "1ST_APPOINTMENT",
    label: "1st App.",
    icon: <FaUserPlus size={20} />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    key: "PRESENTATION",
    label: "Pres.",
    icon: <FaChartBar size={20} />, 
    color: "bg-green-100 text-green-600",
  },
  {
    key: "EVENT",
    label: "Event",
    icon: <FaCalendarAlt size={20} />, 
    color: "bg-pink-100 text-pink-600",
  },
];

const MEETING_TYPES = [
  { key: "MORNING", label: "Morning meeting" },
  { key: "LEADERS", label: "Leaders meeting" },
  { key: "CLIENT", label: "Client meeting" },
  { key: "OWNER", label: "Owner meeting" },
  { key: "OTHER", label: "Other" },
];

const HOSTS = [
  { key: "ROBERT_MILLER", label: "Robert Miller" },
  { key: "STIG_MILLER", label: "Stig Miller" },
  { key: "TRACY_PEW", label: "Tracy Pew" },
  { key: "KLAUS_NOMI", label: "Klaus Nomi" },
  { key: "ROSE_MCDOWALL", label: "Rose McDowall" },
];

const RECURRENCE_CHOICES = [
  { key: "NONE", label: "Never" },
  { key: "DAILY", label: "Daily" },
  { key: "WORKDAYS", label: "Every Workday (Mon–Fri)" },
  { key: "WEEKLY", label: "Weekly" },
  { key: "FORTNIGHTLY", label: "Fortnightly" },
];


export default function EventsForm({ isOpen, onClose, prefill, onSaved }) {
  const dispatch = useDispatch();

  
  const [eventType, setEventType] = useState("MEETING");
  const [meetingType, setMeetingType] = useState("");
  const [host, setHost] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [recurrence, setRecurrence] = useState("NONE");

  // apply prefill on open
  useEffect(() => {
    if (!isOpen) return;
    if (prefill?.eventType) setEventType(prefill.eventType);
    if (prefill?.startTime) setStartTime(prefill.startTime);
    if (prefill?.endTime) setEndTime(prefill.endTime);
    // clear conditional fields each open
    setMeetingType("");
    setHost("");
    setLocation("");
    setNotes("");
    setLink("");
    setRecurrence("NONE");
  }, [isOpen, prefill]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: eventType,
      start_time: startTime,
      end_time: endTime,
      event_type: eventType,
      notes,
      link,
      recurrence_rule: recurrence,
      meeting_type: eventType === "MEETING" ? meetingType : null,
      host:
        eventType === "1ST_APPOINTMENT" || eventType === "PRESENTATION"
          ? host
          : null,
      location: eventType === "EVENT" ? location : null,
    };

    try {
      let action;
      if (prefill?.id) {
       
        action = await dispatch(updateEvent({ id: prefill.id, data: payload }));
      } else {
        
        action = await dispatch(createEvent(payload));
      }

      if (onSaved) onSaved(payload, action);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6 outline-none"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event type buttons */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Event Type
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {EVENT_TYPES.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setEventType(opt.key)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition ${
                  eventType === opt.key
                    ? `${opt.color} border-current`
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional field */}
        {eventType === "MEETING" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Meeting
            </label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select...</option>
              {MEETING_TYPES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {(eventType === "1ST_APPOINTMENT" || eventType === "PRESENTATION") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host
            </label>
            <select
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select...</option>
              {HOSTS.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {eventType === "EVENT" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Paris"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        )}

        {/* Start & End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start
          </label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End
          </label>
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Repeat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repeat
          </label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none"
          >
            {RECURRENCE_CHOICES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
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
    </Modal>
  );
}
