import { createSlice, nanoid } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: []
  },
  reducers: {
    showNotification: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ type = 'info', title, message = '', duration }) {
        return {
          payload: {
            id: nanoid(),
            type,
            title,
            message,
            duration
          }
        };
      }
    },
    closeNotification(state, action) {
      state.items = state.items.filter((notification) => notification.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    }
  }
});

export const {
  showNotification,
  closeNotification,
  clearNotifications
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
