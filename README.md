# Owner’s Schedule 📅

A mini Google/Apple-Calendar–style scheduler with event CRUD, modals, and a clean UI.  
Built with **React + Vite + Redux Toolkit** on the frontend and **Django REST + PostgreSQL** on the backend.

---

## 🚀 Features Implemented

- Week/Day/Month views using **react-big-calendar**.  
- **Event CRUD** (create, edit, delete) with Redux Toolkit thunks wired to Django REST API.  
- **Event form modal** with event-type–specific fields:
  - Meeting → meeting type (morning, client, etc.)  
  - 1st Appointment / Presentation → host  
  - Event → location  
- **Event details modal** showing start, end, host/location, notes, and link.  
- **Notes & Link** fields persisted and displayed.  
- **Color-coded event blocks** with icons and clock display.  
- **Responsive layout** (desktop-first).  

---

## ⚠️ Known Limitations

- **Recurrence**: Events are single only, no RRULE expansion yet.  
- **Exceptions**: No “edit this only / this + future / all in series” yet.  
- **Time zones**: Dates stored/displayed in local time; not normalized to UTC.  
- **Drag & resize**: Not implemented.  
- **Validation**: No collision/overlap checks.  

---

## 🛠 Architecture Decisions

- **State management**: Redux Toolkit + async thunks for API calls.  
- **UI library**: react-big-calendar for grid view, styled with Tailwind and overrides.  
- **Backend**: Django REST Framework + PostgreSQL with REST endpoints at `/api/events/`.  
- **Modal-driven flows**: All create/edit/details flows use modals to reduce UI flicker.  
- **Event structure**: Events map backend data into react-big-calendar props (`start`, `end`, `title`).  

---

## 🔧 Tech Stack

- **Frontend**: React, Vite, Redux Toolkit, Tailwind CSS, React Icons  
- **Calendar**: react-big-calendar + date-fns  
- **Backend**: Django REST Framework, PostgreSQL  
- **API**: REST JSON endpoints (`/api/events/`)  

---

## ⏭ Next Steps (With More Time)

### 1. Recurrence & Expanded Occurrences
- Store recurrence rules in backend (RRULE string).  
- Use [`rrule`](https://github.com/jakubroztocil/rrule) in frontend to expand occurrences dynamically.  
- Render expanded events in react-big-calendar as virtual instances.  

### 2. Exception Editing
- Add `series_id` + `is_exception` fields in backend model.  
- On edit/delete, provide options:  
  - **This event only** → create an exception override.  
  - **This + future** → split the RRULE into two rules.  
  - **All in series** → update base recurrence.  

### 3. Time Zones
- Store all timestamps in UTC in PostgreSQL.  
- Convert/display using `date-fns-tz` or `luxon` (`toZonedTime`).  
- Add user setting for preferred timezone (default: Europe/London).  
- Ensure **DST/BST transitions** are respected.  

### 4. Stretch Goals
- Drag/drop and resize events (`onEventDrop`, `onEventResize`).  
- Basic accessibility (keyboard navigation, screen reader support).  
- Testing edge cases (DST transitions, recurring event overlaps).  

---

## 🧪 Backend Testing (Future Work)

With more time, I’d implement backend test coverage using **pytest** or Django’s test framework:

### CRUD correctness
- Create, fetch, update, delete events.  
- Assert DB state and correct HTTP status codes (`201`, `200`, `204`).  

### Recurrence expansion
- Test `RRULE` parsing (daily, weekly, fortnightly, workdays).  
- Boundary cases: `UNTIL`, `COUNT`, leap years (Feb 29).  

### Exception handling
- Verify “this event only”, “this + future”, “all in series” edit/delete scopes.  
- Ensure deleting one occurrence doesn’t break the full series.  

### Time zones & DST
- Store in UTC, fetch in `Europe/London`.  
- Test across DST shifts (March/October).  
- Edge case: ambiguous/invalid times (e.g. 01:30 at DST switch).  

### Validation
- Start time before end time.  
- Prevent overlaps for same host (if required).  
- Recurrence + exceptions should not create infinite loops.  

### Performance
- Stress-test fetching thousands of expanded events.  
- Paginate long-running series.  
- Concurrent create/delete requests.  

### Security
- Auth checks: only owners can edit/delete their events.  
- Invalid IDs → `404 Not Found`.  
- Confirm no SQL injection (ORM safety).  

---
