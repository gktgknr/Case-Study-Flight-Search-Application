import React from "react";
import { useParams } from "react-router-dom";

const FlightDetail = () => {
  const { id } = useParams();
  return <div>FlightDetail {id}</div>;
};

export default FlightDetail;
