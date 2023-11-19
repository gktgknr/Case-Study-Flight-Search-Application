import { Box } from "@mui/material";
import React from "react";
import Search from "../components/Search";

const Home = () => {
  return (
    <Box
      sx={{
        p: 4,
        background: "#fff",
        borderRadius: "4px",
        boxShadow: "2px 2px 6px #ddd",
      }}
    >
      <Search />
    </Box>
  );
};

export default Home;