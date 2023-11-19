// import { Box } from "@mui/material";
// import React from "react";
// import Search from "../components/Search";

// const Home = () => {
//   return (
//     <Box
//       sx={{
//         p: 4,
//         background: "#fff",
//         borderRadius: "4px",
//         boxShadow: "2px 2px 6px #ddd",
//       }}
//     >
//       <Search />
//     </Box>
//   );
// };

// export default Home;

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
  Tabs,
  Tab,
  Snackbar,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import airports from "../data/airports";
import tickets from "../data/tickets";
import MuiAlert from "@mui/material/Alert";
import {
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";

const Home = () => {
  const [tabValue, setTabValue] = useState(0);
  const [departureAirport, setDepartureAirport] = useState(null);
  const [arrivalAirport, setArrivalAirport] = useState(null);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returnTickets, setReturnTickets] = useState([]);
  const [departureDate, setDepartureDate] = useState(
    dayjs().endOf("day").format("YYYY-MM-DD")
  );
  const [returningDate, setReturningDate] = useState(
    dayjs().endOf("day").format("YYYY-MM-DD")
  );
  const [noAvailableTickets, setNoAvailableTickets] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const handleSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Table columns
  const tableColumns = [
    {
      field: "id",
      headerName: "Uçuş No",
      width: 100,
      renderCell: (params) => `${params.row.flightNumber}`,
    },
    {
      field: "departureAirport",
      headerName: "Kalkış Yeri",
      width: 200,
      sortable: false,
      filterable: false,
    },
    {
      field: "arrivalAirport",
      headerName: "Varış Yeri",
      width: 200,
      sortable: false,
      filterable: false,
    },
    { field: "departureDate", headerName: "Uçuş Tarihi", width: 100 },
    { field: "departureTime", headerName: "Kalkış Saati", width: 100 },
    { field: "arrivalTime", headerName: "Varış Saati", width: 100 },
    {
      field: "flightTime",
      headerName: "Uçuş Süresi",
      width: 150,
      renderCell: (params) =>
        calculateFlightTime(params.row.departureTime, params.row.arrivalTime),
    },
    {
      field: "price",
      headerName: "Fiyat",
      width: 100,
      renderCell: (params) => ` ${params.row.currency} ${params.row.price}`,
    },
    {
      field: "country",
      headerName: "Ülke",
      width: 150,
      renderCell: (params) => (
        <div>
          {params.row.arrivalCountry}
        </div>
      ),
    },
    
    {
      field: "action",
      headerName: "Detaylar",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="text"
          color="primary"
          sx={{ width: "50%", height: "100%" }}
          href={`flights/${params.row.id}`}
        >
          Detaylar
        </Button>
      ),
    },
  ];

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setAvailableTickets([])   //  Sayfa değiştirince availeble ticketa boş dizi atıyor 
  };

  // Handle departure and arrival airport change
  const handleChangeDeparture = (event, newValue) => {
    setDepartureAirport(newValue);
  };

  // Handle departure and arrival airport change
  const handleChangeArrival = (event, newValue) => {
    setArrivalAirport(newValue);
  };

  // Calculate flight time
  const calculateFlightTime = (departureTime, arrivalTime) => {
    const departureTimeArray = departureTime.split(":");
    const arrivalTimeArray = arrivalTime.split(":");

    const departureHours = parseInt(departureTimeArray[0]);
    const departureMinutes = parseInt(departureTimeArray[1]);
    const arrivalHours = parseInt(arrivalTimeArray[0]);
    const arrivalMinutes = parseInt(arrivalTimeArray[1]);

    let flightHours = 0;
    let flightMinutes = 0;

    if (
      arrivalHours > departureHours ||
      (arrivalHours === departureHours && arrivalMinutes >= departureMinutes)
    ) {
      flightHours = arrivalHours - departureHours;
      flightMinutes = arrivalMinutes - departureMinutes;
    } else {
      flightHours = 24 - departureHours + arrivalHours;
      if (arrivalMinutes >= departureMinutes) {
        flightMinutes = arrivalMinutes - departureMinutes;
      } else {
        flightMinutes = 60 - departureMinutes + arrivalMinutes;
        flightHours--;
      }
    }

    const totalFlightMinutes = flightHours * 60 + flightMinutes;
    const flightTime = formatTime(totalFlightMinutes);
    return flightTime;
  };

  // Format time
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let hourString = "";
    let minuteString = "";

    if (hours > 0) {
      hourString = hours + " saat";
    }

    if (minutes > 0) {
      minuteString = minutes + " dakika";
    }

    if (hours > 0 && minutes > 0) {
      return `${hourString} ${minuteString}`;
    } else if (hours > 0) {
      return hourString;
    } else if (minutes > 0) {
      return minuteString;
    } else {
      return "0 dakika";
    }
  };

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      getAvailableTickets(); // Burası her türlü çalışmalı

      if (tabValue === 1) {
        getAvailableReturnTickets(); // Gidiş dönüş olunca geri dönüş için kullanıyoruz
      } 
      setLoading(false);
    }, 3000);
  };

  //Gidiş uçuşlarını listele
  const getAvailableTickets = () => {
    const getTickets = tickets.filter(
      (ticket) =>
        ticket.departureAirportId === departureAirport?.id &&
        ticket.arrivalAirportId === arrivalAirport?.id &&
        ticket.departureDate === departureDate 
    );
    setAvailableTickets(getTickets);
    setNoAvailableTickets(getTickets.length === 0);
    
    //Kontrol: Uygun uçuş bulunamazsa Snackbar'ı aç
    if (getTickets.length === 0) {
      setSnackbarMessage("Uygun gidiş uçuşu bulunamadı!");
      setSnackbarOpen(true);
    } else {
      setSnackbarOpen(false);
    }
  };

  //Dönüş uçuşlarını listele
  const getAvailableReturnTickets = () => {
    const getReturnTickets = tickets.filter(
      (ticket) =>
        ticket.departureAirportId === arrivalAirport?.id &&
        ticket.arrivalAirportId === departureAirport?.id &&
        ticket.departureDate === returningDate
    );
    setReturnTickets(getReturnTickets); 
    setNoAvailableTickets(getReturnTickets.length === 0);
    if (getReturnTickets.length === 0) {
      handleSnackbar("Uygun dönüş uçuşu bulunamadı!");
    } else {
      setSnackbarOpen(false);
    }
  };

  return (
        <Box
      sx={{
        p: 4,
        background: "#fff",
        borderRadius: "4px",
        boxShadow: "2px 2px 6px #ddd",
      }}
    >
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Tek Yön" />
        <Tab label="Gidiş Dönüş" />
      </Tabs>
  
      {tabValue === 0 && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ width: "100%" }}
              value={departureAirport}
              onChange={handleChangeDeparture}
              options={airports}
              getOptionLabel={(option) => `${option.name} (${option.country})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Kalkış Havaalanı"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ width: "100%" }}
              value={arrivalAirport}
              onChange={handleChangeArrival}
              options={airports}
              getOptionLabel={(option) => `${option.name} (${option.country})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Varış Havaalanı"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["DatePicker", "DatePicker"]}
                sx={{
                  paddingTop: "10px!important",
                  marginTop: "-10px!important",
                }}
              >
                <DatePicker
                  sx={{
                    width: "100%",
                  }}
                  label="Uçuş Tarihi"
                  format="DD/MM/YYYY"
                  value={dayjs(departureDate)}
                  onChange={(date) =>
                    setDepartureDate(
                      dayjs(date).endOf("day").format("YYYY-MM-DD")
                    )
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "100%", height: "100%" }}
              onClick={handleSearch}
              disabled={
                departureAirport === null ||
                arrivalAirport === null ||
                departureDate === null
              }
            >
              Uçuş Ara
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <Box>
              {loading === true ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                ""
              )}
              {availableTickets.length !== 0 && (
                <Box sx={{ mt: 1 }}>
                  <DataGrid
                    rows={availableTickets}
                    columns={tableColumns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    pageSizeOptions={[5]}
                  />
                </Box>
              )}
              {noAvailableTickets && (
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={6000}
                  onClose={() => setSnackbarOpen(false)}
                >
                  <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                    severity="warning"
                  >
                    {snackbarMessage}
                  </MuiAlert>
                </Snackbar>
              )}
            </Box>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ width: "100%" }}
              value={departureAirport}
              onChange={handleChangeDeparture}
              options={airports}
              getOptionLabel={(option) => `${option.name} (${option.country})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Kalkış Havaalanı"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ width: "100%" }}
              value={arrivalAirport}
              onChange={handleChangeArrival}
              options={airports}
              getOptionLabel={(option) => `${option.name} (${option.country})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Varış Havaalanı"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["DatePicker", "DatePicker"]}
                sx={{
                  paddingTop: "10px!important",
                  marginTop: "-10px!important",
                }}
              >
                <DatePicker
                  sx={{
                    width: "100%",
                  }}
                  label="Gidiş Tarihi"
                  format="DD/MM/YYYY"
                  value={dayjs(departureDate)}
                  onChange={(date) =>
                    setDepartureDate(
                      dayjs(date).endOf("day").format("YYYY-MM-DD")
                    )
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["DatePicker", "DatePicker"]}
                sx={{
                  paddingTop: "10px!important",
                  marginTop: "-10px!important",
                }}
              >
                <DatePicker
                  sx={{
                    width: "100%",
                  }}
                  label="Dönüş Tarihi"
                  format="DD/MM/YYYY"
                  value={dayjs(returningDate)}
                  onChange={(date) =>
                    setReturningDate(
                      dayjs(date).endOf("day").format("YYYY-MM-DD")
                    )
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "100%", height: "100%" }}
              onClick={handleSearch}
              disabled={
                departureAirport === null ||
                arrivalAirport === null ||
                departureDate === null ||
                returningDate === null
              }
            >
              Uçuş Ara
            </Button>
          </Grid>
            <Grid item xs={12} md={12}>
              <Box>
                {loading === true ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  ""
                )}
              {availableTickets.length !== 0 && (   // Gidiş uçuşları
                <Grid item xs={12} md={12}>
                  <Box sx={{ marginBottom: 1 }}>
                          <Box component="h5" fontWeight="bold">
                            Gidiş Uçuşları
                          </Box>
                        </Box>
                <DataGrid
                  rows={availableTickets}
                  columns={tableColumns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                />
                </Grid>
              )}
               {returnTickets.length !== 0 && (   //  Dönüş uçuşları
                
                <Grid item xs={12} md={12}>
                  <Box sx={{ marginBottom: 1 }}>
                          <Box component="h5" fontWeight="bold">
                            Dönüş Uçuşları
                          </Box>
                        </Box>
                <DataGrid
                  rows={returnTickets}
                  columns={tableColumns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                />
                </Grid>
              )}
              {noAvailableTickets && (
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={6000}
                  onClose={() => setSnackbarOpen(false)}
                >
                  <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                    severity="warning"
                  >
                    {snackbarMessage}
                  </MuiAlert>
                </Snackbar>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
      {noAvailableTickets && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            severity="warning"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      )}
    </Box>
    </Box>
  );
  
};
  export default Home;
// bunu radio butonla dry prensibine bağlı kalarakta yazabilirdim ancak görsel olarak tab yapısı hoşuma gittiği için bu şekilde kullandım tab value 1 de tab value 0 ı çoğunlukla tekrar edicektim.
