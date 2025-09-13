import React from 'react';
import CalendarView from './components/CalendarView';
import EventsForm from './features/events/EventsForm';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Owner’s Schedule</h1>
      <EventsForm />
      <CalendarView />
    </div>
  );
}

export default App;
