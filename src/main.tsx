import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const { BASE_URL } = import.meta.env;

const Articles = React.lazy(() => import("./pages/Articles"));

ReactDOM.createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="articles" element={<Articles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
