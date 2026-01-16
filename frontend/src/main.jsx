import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { io } from "socket.io-client";

const queryClient = new QueryClient()

// Initialize Socket Connection
// Initialize Socket Connection
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('surgery_updated', (data) => {
  console.log('Real-time update received:', data);
  // Invalidate all relevant queries to trigger refetch
  queryClient.invalidateQueries({ queryKey: ['surgeryStats'] });
  queryClient.invalidateQueries({ queryKey: ['todaySurgeries'] });
  queryClient.invalidateQueries({ queryKey: ['surgeries'] });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
