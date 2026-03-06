import { reactive } from 'vue';
import api from '@/utils/api';

// This is our global, reactive state
export const settings = reactive({
  siteName: 'Damel Dimsum',
  siteLogo: '',
  siteFavicon: '',
  announcement: '',
  mainWhatsapp: '',
  email: '',
  instagram: '',
  facebook: '', // ADD THIS
  address: '',
});

// This function will be called once when the app starts
export async function fetchSettings() {
  try {
    const res = await api.get('/settings');
    // Update the reactive state with data from the backend
    Object.assign(settings, res.data.data);
    console.log("Global settings loaded:", settings);
  } catch (e) {
    console.error("Failed to fetch global settings.");
  }
}