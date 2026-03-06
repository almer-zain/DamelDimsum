// src/utils/eventBus.js
import { reactive } from 'vue';

const bus = reactive({
  events: {},
  
  // Listen for an event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  // Fire an event
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
});

// A simple helper function to make it easy to use
export const useEventBus = () => bus;

export const showToast = (message, type = 'success') => {
  bus.emit('show-toast', { message, type });
};