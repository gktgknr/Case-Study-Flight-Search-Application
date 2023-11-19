import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Container } from "@mui/material";
const App = () => {
  return (
    <BrowserRouter>
      <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
