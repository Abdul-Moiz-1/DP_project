import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { EventProvider } from "./contexts/eventContext.tsx";
import { ToastProvider } from "./components/toast-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <AuthProvider>
          <EventProvider>
            <ToastProvider>
              <App />
            </ToastProvider>

          </EventProvider>
          
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
