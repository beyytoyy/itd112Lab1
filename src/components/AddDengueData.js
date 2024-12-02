import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TextField, Button, Container, Grid } from "@mui/material";

const AddDengueData = () => {
  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [regions, setRegions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "dengueData"), {
        location,
        cases: Number(cases),
        deaths: Number(deaths),
        date,
        regions,
      });
      setLocation("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegions("");
      alert("Data added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Container>
      <h2>Add Dengue Data</h2>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Cases"
              type="number"
              value={cases}
              onChange={(e) => setCases(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Deaths"
              type="number"
              value={deaths}
              onChange={(e) => setDeaths(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Regions"
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit">
              Add Data
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddDengueData;
