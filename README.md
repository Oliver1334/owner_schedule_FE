# Owner’s Schedule 📅

A mini Google/Apple-Calendar–style scheduler with event CRUD, modals, and a clean UI.  
Built with **React + Vite + Redux Toolkit** frontend and **Django REST + PostgreSQL** backend.

Deployed App: https://owner-schedule-fe.onrender.com/

---

## Features Implemented

- Week/Day/Month views using **react-big-calendar**.  
- **Event CRUD** (create, edit, delete) with Redux Toolkit thunks wired to Django REST API.
- **Drag to Create** Click drag to create event timeslot.
- **Event form modal** with event-type–specific fields:
  - Meeting → meeting type (morning, client, etc.)  
  - 1st Appointment / Presentation → host  
  - Event → location  
- **Event details modal** showing start, end, host/location, notes, and link.  
- **Notes & Link** fields persisted and displayed.  
- **Color-coded event blocks** with icons and clock display.  
- **Responsive layout** (desktop-first).  

---

## Known Limitations

- **Recurrence**: Events are single only, no RRULE expansion yet.  
- **Exceptions**: No “edit this only / this + future / all in series” yet.  
- **Time zones**: Dates stored/displayed in local time; not normalized to UTC.  
- **Drag & resize**: Not implemented.  
- **Validation**: No collision/overlap checks.  

---

## Architecture Decisions

- **State management**: Redux Toolkit + async thunks for API calls.  
- **UI library**: react-big-calendar for grid view, styled with Tailwind and overrides.  
- **Backend**: Django REST Framework + PostgreSQL with REST endpoints at `/api/events/`.  
- **Modal-driven flows**: All create/edit/details flows use modals to reduce UI flicker.   

---

## Next Steps (With More Time)

### 1. Recurrence & Expanded Occurrences
- Store recurrence rules in backend.  
- Use in frontend to expand occurrences dynamically.  
- Render expanded events in react-big-calendar.  

### 2. Exception Editing
- Add `series_id` + `is_exception` fields in backend model.  
- On edit/delete, provide options:  
  - **This event only** → create an exception override.  
  - **This + future** → split the RRULE into two rules.  
  - **All in series** → update base recurrence.  

### 3. Time Zones
- Store all timestamps in UTC in PostgreSQL.  
- Convert/display using `date-fns-tz` (`toZonedTime`).  
- Add user setting for preferred timezone (default: Europe/London).  
- Ensure **DST/BST transitions** are respected.  

### 4. Styling
- Understand React-Big-Calendar styling options more extensively.
- Live time marker visible on calendar.
- Accurate time blocks for events mapped on calendar.  

##  Backend Testing

With more time, I’d implement backend test coverage using **pytest** or Django’s test framework:

### CRUD correctness
- Create, fetch, update, delete events.  
- Assert DB state and correct HTTP status codes (`201`, `200`, `204`).  

### Recurrence expansion
- Test `RRULE` parsing (daily, weekly, fortnightly, workdays).  

### Exception handling
- Verify “this event only”, “this + future”, “all in series” edit/delete scopes.  
- Ensure deleting one occurrence doesn’t break the full series.  

### Time zones & DST
- Store in UTC, fetch in `Europe/London`.  
- User setting to display timezone.

### Validation
- Start time before end time.  
- Prevent overlaps for same host (if required).  
- Recurrence + exceptions should not create infinite loops.  

### Frontend Error Handling
- Error handling for forms to ensure correct data is entered to payloads.

---
