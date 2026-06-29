import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { store } from './store';
import App from './App';
import './index.css';
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={{
        token: {
          colorPrimary: '#4F46E5',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif'
        }
      }}>
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>);