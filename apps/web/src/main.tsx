import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/site-layout";
import { BookingPage } from "./pages/booking-page";
import { ConfirmationPage } from "./pages/confirmation-page";
import { HomePage } from "./pages/home-page";
import { RoomDetailPage } from "./pages/room-detail-page";
import { RoomsPage } from "./pages/rooms-page";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
