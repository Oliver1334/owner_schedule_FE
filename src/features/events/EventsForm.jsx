import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createEvent } from './eventsSlice';

export default function EventsForm() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState('MEETING');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createEvent({
        title,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        recurrence_rule: 'NONE',
      })
    );
    setTitle('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />
      <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
        <option value="MEETING">Meeting</option>
        <option value="1ST_APPOINTMENT">1st Appointment</option>
        <option value="PRESENTATION">Presentation</option>
        <option value="EVENT">Event</option>
      </select>
      <button type="submit">Add Event</button>
    </form>
  );
}
