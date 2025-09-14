import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchEvents as fetchEventsThunk, 
    updateEvent as updateEventThunk, 
    deleteEvent as deleteEventThunk 
  } from "../features/events/eventsSlice";
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
import Modal from "react-modal";
import { FaRegClock } from "react-icons/fa";

Modal.setAppElement("#root"); 

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

/* Status mapping (for event coloring) */
const EVENT_STATUS = {
  1: { label: "Pending", color: "#718096" },
  2: { label: "Confirmed", color: "#38A169" },
  3: { label: "In Progress", color: "#D69E2E" },
  4: { label: "Completed", color: "#3182CE" },
  5: { label: "Cancelled", color: "#9F7AEA" },
};


const parseDate = (d) => (typeof d === "string" ? parseISO(d) : new Date(d));
const toDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function UserCalendar() {
  const dispatch = useDispatch();
  const eventsFromStore = useSelector((state) => state.events.items);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
 
  // Event details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // EventsForm modal
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const mappedEvents = eventsFromStore.map((e) => ({
    id: e.id,
    title: e.event_type, // what shows inside calendar block
    start: parseDate(e.start_time),
    end: parseDate(e.end_time),
    status: e.status ?? 1,
    event_type: e.event_type, // keep original for coloring
    raw: e,
  }));

  useEffect(() => {
    dispatch(fetchEventsThunk());
  }, [dispatch]);

  /* Navigation */
  const moveDate = (direction) => {
    const d = new Date(date);
    if (view === Views.MONTH) d.setMonth(d.getMonth() + direction);
    else if (view === Views.WEEK) d.setDate(d.getDate() + 7 * direction);
    else if (view === Views.DAY) d.setDate(d.getDate() + 1 * direction);
    else d.setDate(d.getDate() + 7 * direction);
    setDate(new Date(d));
  };

  /* Add Event -> open EventsForm */
  const openBlankForm = () => {
    setPrefill({
      startTime: toDatetimeLocal(new Date()),
      endTime: toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
      eventType: "MEETING",
    });
    setModalOpen(true);
  };

  /* Slot selection -> open EventsForm Time Prefill*/
  const handleSelectSlot = (slotInfo) => {
    setPrefill({
      startTime: toDatetimeLocal(slotInfo.start),
      endTime: toDatetimeLocal(slotInfo.end),
      eventType: "MEETING",
    });
    setModalOpen(true);
  };

  
const handleEdit = () => {
    if (!selectedEvent) return;
  
    setPrefill({
      ...selectedEvent,
      startTime: selectedEvent.start_time,
      endTime: selectedEvent.end_time,
      eventType: selectedEvent.event_type,
    });
    setDetailsOpen(false);
    setModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
  
    await dispatch(deleteEventThunk(selectedEvent.id));
    setDetailsOpen(false);
    dispatch(fetchEventsThunk());
  };

  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event.raw);
    setDetailsOpen(true);
  };

  const EVENT_TYPE_STYLES = {
    MEETING: "bg-blue-600",
    "1ST_APPOINTMENT": "bg-purple-600",
    PRESENTATION: "bg-green-600",
    EVENT: "bg-pink-600",
  };

  const EventItem = ({ event }) => (
    <div className="flex flex-col h-full w-full px-2 py-1 rounded-md text-white">
     
      <span className="text-sm font-semibold truncate">{event.title}</span>
  
      <div className="flex items-center text-xs mt-1">
        <FaRegClock className="mr-1 opacity-90" size={12} />
        {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
        {event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );

  return (
    <div className="p-5 font-sans">
     
<div className="flex items-center gap-4 mb-4">
  
  <button
    onClick={openBlankForm}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
  >
    Add Event
  </button>

  {/* Event type KEY*/}
  <div className="flex gap-2">
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${EVENT_TYPE_STYLES.MEETING}`}>
      Meeting
    </div>
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${EVENT_TYPE_STYLES["1ST_APPOINTMENT"]}`}>
      1st Appointment
    </div>
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${EVENT_TYPE_STYLES.PRESENTATION}`}>
      Presentation
    </div>
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${EVENT_TYPE_STYLES.EVENT}`}>
      Event
    </div>
  </div>


        
      </div>

      {/* Calendar */}
      <div className="h-[75vh] min-h-[500px] border rounded-xl shadow-lg bg-white p-3">
        <Calendar
          localizer={localizer}
          events={mappedEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          view={view}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(d) => setDate(d)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          components={{ event: EventItem }}
          eventPropGetter={(event) => {
            const colorMap = {
              MEETING: "rgba(37, 99, 235, 0.85)",       
              "1ST_APPOINTMENT": "rgba(147, 51, 234, 0.85)", 
              PRESENTATION: "rgba(22, 163, 74, 0.85)",  
              EVENT: "rgba(219, 39, 119, 0.85)",        
            };
          
            const backgroundColor = colorMap[event.event_type] || "rgba(75, 85, 99, 0.85)"; 
          
            return {
              style: {
                backgroundColor,
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "2px 4px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                lineHeight: "1.1",
              },
            };
          }}
        />
      </div>

      {/* Shared EventsForm modal*/}
      <EventsForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prefill={prefill}
        onSaved={() => dispatch(fetchEventsThunk())}
      />
     <Modal
  isOpen={detailsOpen}
  onRequestClose={() => setDetailsOpen(false)}
  overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 outline-none"
>
  {selectedEvent && (
    <div>
      <h2 className="text-xl font-bold mb-4">{selectedEvent.event_type}</h2>

      <p><strong>Start:</strong> {new Date(selectedEvent.start_time).toLocaleString()}</p>
      <p><strong>End:</strong> {new Date(selectedEvent.end_time).toLocaleString()}</p>
      {selectedEvent.notes && (
        <p><strong>Notes:</strong> {selectedEvent.notes}</p>
      )}
      {selectedEvent.link && (
        <p>
          <strong>Link:</strong>{" "}
          <a
            href={selectedEvent.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {selectedEvent.link}
          </a>
        </p>
      )}
      {selectedEvent.host && <p><strong>Host:</strong> {selectedEvent.host}</p>}
      {selectedEvent.location && <p><strong>Location:</strong> {selectedEvent.location}</p>}

      {/* Buttons */}
      <div className="flex justify-between mt-6">
  <button
    onClick={handleEdit}
    className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600"
  >
    Edit
  </button>

  <button
    onClick={handleDelete}
    className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
  >
    Delete
  </button>

  <button
    onClick={() => setDetailsOpen(false)}
    className="px-4 py-2 rounded-lg bg-gray-400 text-white font-medium hover:bg-gray-500"
  >
    Close
  </button>
</div>
    </div>
  )}
</Modal>
    </div>
  );
}
