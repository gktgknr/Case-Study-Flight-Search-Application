import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Container } from "@mui/material";
import FlightList from "./pages/FlightList";
import FlightDetail from "./pages/FlightDetail";
const App = () => {
  return (
    <BrowserRouter>
      <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/flights" element={<FlightList />} />
          <Route path="/flights/:id" element={<FlightDetail />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
