import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://owner-schedule-be.onrender.com/api/events/";

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData) => {
    const response = await axios.post(API_URL, eventData);
    return response.data;
  }
);


export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (eventId) => {
    await axios.delete(`${API_URL}${eventId}/`);
    return eventId;
  }
);


export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}${id}/`, data);
    return response.data;
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    items: [],
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default eventsSlice.reducer;
