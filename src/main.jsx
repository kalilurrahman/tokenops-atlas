import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const base = import.meta.env.BASE_URL || "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App basePath={base} />
  </React.StrictMode>
);
