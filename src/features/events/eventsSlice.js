import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://owner-schedule-be.onrender.com/api/events/';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const createEvent = createAsyncThunk('events/createEvent', async (eventData) => {
  const response = await axios.post(API_URL, eventData);
  return response.data;
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default eventsSlice.reducer;
