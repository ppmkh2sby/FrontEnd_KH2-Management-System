import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./LandingPage";
import { LoginPage } from "./LoginPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
