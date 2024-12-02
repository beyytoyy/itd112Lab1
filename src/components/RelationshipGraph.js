import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Container, Button, ButtonGroup, Form } from 'react-bootstrap';

// Register required components in Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CorrelationGraphBar = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const dengueSnapshot = await getDocs(dengueCollection);
      const dataList = dengueSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(dataList);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (period === "monthly" && selectedMonth) {
      filtered = filtered.filter(d => new Date(d.date).getMonth() + 1 === parseInt(selectedMonth));
    } else if (period === "yearly" && selectedYear) {
      filtered = filtered.filter(d => new Date(d.date).getFullYear() === parseInt(selectedYear));
    }

    setFilteredData(filtered);
  }, [data, period, selectedMonth, selectedYear]);

  // Prepare data for Chart.js
  const chartData = {
    labels: filteredData.map(d => d.date), // Dates on the X-axis
    datasets: [
      {
        label: 'Cases',
        data: filteredData.map(d => d.cases),
        backgroundColor: 'rgba(136, 132, 216, 0.8)', // Violet
        borderColor: 'rgba(136, 132, 216, 1)',
        borderWidth: 1,
      },
      {
        label: 'Deaths',
        data: filteredData.map(d => d.deaths),
        backgroundColor: 'rgba(130, 202, 157, 0.8)', // Green
        borderColor: 'rgba(130, 202, 157, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dengue Cases and Deaths Comparison',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12, // Adjust the font size for the x-axis labels
          },
          maxRotation: 45, // Rotate labels to avoid overlap
          minRotation: 45,
        },
      },
    },
  };

  return (
    <Container>
      <ButtonGroup className="mb-3">
        <Button variant={period === "monthly" ? "primary" : "secondary"} onClick={() => setPeriod("monthly")}>Monthly</Button>
        <Button variant={period === "yearly" ? "primary" : "secondary"} onClick={() => setPeriod("yearly")}>Yearly</Button>
      </ButtonGroup>

      {period === "monthly" && (
        <Form.Group>
          <Form.Label>Month</Form.Label>
          <Form.Control as="select" onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
            <option value="">Select Month</option>
            {[...Array(12).keys()].map(i => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </Form.Control>
        </Form.Group>
      )}
      {period === "yearly" && (
        <Form.Group>
          <Form.Label>Year</Form.Label>
          <Form.Control type="number" onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear} />
        </Form.Group>
      )}

      {/* Render the bar chart */}
      <Bar data={chartData} options={chartOptions} />
    </Container>
  );
};

export default CorrelationGraphBar;
