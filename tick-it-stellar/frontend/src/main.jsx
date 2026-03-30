import {createRoot} from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css"

import App from "./pages/index2";
import Auth from "./pages/auth/auth.jsx";
import BaseLayout from "./layouts/base-layout.jsx"
import Dashboard from "./pages/dashboard.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route element={<BaseLayout />}>
                <Route index element={<App />} />
                <Route path='/login' element={<Auth />} />
                <Route path='/dashboard' element={<Dashboard />} />
            </Route>
        </Routes>
    </BrowserRouter>,
)
