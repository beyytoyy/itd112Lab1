import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddDengueData from "./components/AddDengueData";
import DengueDataList from "./components/DengueDataList";
import ComparisonGraph from "./components/ComparisonGraph";
import RelationshipGraph from "./components/RelationshipGraph";
import { AppBar, Toolbar, Button, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { db } from "./firebase"; // Assuming firebase is set up
import { collection, getDocs } from "./firebase";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [totalCases, setTotalCases] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dengueCollection = collection(db, "dengueData");
        const dengueSnapshot = await getDocs(dengueCollection);
        const dataList = dengueSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Calculate total cases and deaths
        const totalCases = dataList.reduce((acc, cur) => acc + cur.cases, 0);
        const totalDeaths = dataList.reduce((acc, cur) => acc + cur.deaths, 0);
  
        setTotalCases(totalCases);
        setTotalDeaths(totalDeaths);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Dengue Dashboard
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
                  <Typography variant="h4" gutterBottom style={{ margin: '20px 0' }}>
                    Dengue Cases Dashboard
                  </Typography>

                  {/* Dashboard Summary Cards */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Cases</Typography>
                          <Typography variant="h4" style={{ color: 'violet' }}>
                            {totalCases}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Deaths</Typography>
                          <Typography variant="h4" style={{ color: 'green' }}>
                            {totalDeaths}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Graphs */}
                  <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    <Grid item xs={12} md={6}>
                      <ComparisonGraph />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RelationshipGraph />
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
