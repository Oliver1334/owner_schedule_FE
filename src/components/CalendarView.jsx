import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../features/events/eventsSlice';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseISO } from 'date-fns';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enGB } from 'date-fns/locale'; // London/UK locale

const locales = {
  'en-GB': enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.items);
  const [mappedEvents, setMappedEvents] = useState([]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    // Map backend events to react-big-calendar format
    const mapped = events.map((e) => ({
      id: e.id,
      title: e.title,
      start: parseISO(e.start_time),
      end: parseISO(e.end_time),
    }));
    setMappedEvents(mapped);
  }, [events]);

  return (
    <div style={{ height: '90vh', padding: '20px' }}>
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: '100%' }}
      />
    </div>
  );
}