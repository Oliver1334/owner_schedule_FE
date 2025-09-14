import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createEvent } from "./eventsSlice";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function EventsForm() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState("MEETING");
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createEvent({
        title,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        recurrence_rule: "NONE",
      })
    );
    setTitle("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <Modal
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)} // close modal on background click or ESC
      contentLabel="Create Event"
    >
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        {/* your existing form fields */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="MEETING">Meeting</option>
          <option value="1ST_APPOINTMENT">1st Appointment</option>
          <option value="PRESENTATION">Presentation</option>
          <option value="EVENT">Event</option>
        </select>
        <button type="submit">Add Event</button>
      </form>
      <button onClick={() => setModalOpen(false)}>Cancel</button>
    </Modal>
  );
}
