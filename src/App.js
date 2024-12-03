import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddDengueData from "./components/AddDengueData";
import DengueDataList from "./components/DengueDataList";
import ComparisonGraph from "./components/ComparisonGraph";
import RelationshipGraph from "./components/RelationshipGraph";
import Map from "./components/maps";
import { AppBar, Toolbar, Button, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import * as d3 from "d3"; // D3 for CSV parsing
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [totalCases, setTotalCases] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        // Fetch and parse the CSV data
        const response = await fetch(`/dataset.csv`);
        const text = await response.text();
        const parsedData = d3.csvParse(text);

        // Log the parsed data for debugging
        console.log("Parsed CSV Data:", parsedData);

        // Calculate total cases and deaths
        const totalCases = parsedData.reduce((acc, cur) => {
          const cases = parseInt(cur.cases, 10) || 0; // Convert cases to a number
          return acc + cases;
        }, 0);

        const totalDeaths = parsedData.reduce((acc, cur) => {
          const deaths = parseInt(cur.deaths, 10) || 0; // Convert deaths to a number
          return acc + deaths;
        }, 0);

        setTotalCases(totalCases);
        setTotalDeaths(totalDeaths);
      } catch (error) {
        console.error("Error fetching CSV data:", error);
      }
    };

    fetchCSVData();
  }, []);

  return (
    <Router>
      <div className="App" style={{ marginBottom: "100px" }}>
        {/* Navigation Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Dengue Cases
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/comparison">
              Comparison
            </Button>
            <Button color="inherit" component={Link} to="/correlation">
              Correlation
            </Button>
            <Button color="inherit" component={Link} to="/add">
              Add Dengue Data
            </Button>
            <Button color="inherit" component={Link} to="/list">
              Data List
            </Button>
          </Toolbar>
        </AppBar>

        {/* Routes for Different Components */}
        <Container>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <Typography variant="h4" gutterBottom style={{ margin: "20px 0" }}>
                    Dashboard
                  </Typography>

                  <Grid container spacing={3} style={{ marginBottom: "30px" }}>
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">Total Cases</Typography>
                              <Typography variant="h4" style={{ color: "violet" }}>
                                {totalCases}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">Total Deaths</Typography>
                              <Typography variant="h4" style={{ color: "green" }}>
                                {totalDeaths}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Map />
                    </Grid>
                  </Grid>

                  {/* Graphs */}
                  <Grid container spacing={3} style={{ marginTop: "20px" }}>
                    <Grid item xs={12} md={6}>
                      <Card style={{ border: "2px solid #ddd" }}>
                        <CardContent>
                          <ComparisonGraph />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card style={{ border: "2px solid #ddd" }}>
                        <CardContent>
                          <RelationshipGraph />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </div>
              }
            />
            <Route path="/comparison" element={<ComparisonGraph />} />
            <Route path="/correlation" element={<RelationshipGraph />} />
            <Route path="/add" element={<AddDengueData />} />
            <Route path="/list" element={<DengueDataList />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
