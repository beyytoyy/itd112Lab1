import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Container, Button, ButtonGroup, Form } from 'react-bootstrap';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ComparisonGraph = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
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
    labels: filteredData.map(d => d.date), // X-axis dates
    datasets: [
      {
        label: 'Cases',
        data: filteredData.map(d => d.cases),
        borderColor: 'rgba(136, 132, 216, 1)', // Violet line color
        backgroundColor: 'rgba(136, 132, 216, 0.2)', // Slight fill
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Deaths',
        data: filteredData.map(d => d.deaths),
        borderColor: 'rgba(130, 202, 157, 1)', // Green line color
        backgroundColor: 'rgba(130, 202, 157, 0.2)', // Slight fill
        fill: true,
        tension: 0.4,
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
            size: 12,
          },
          maxRotation: 45, // Rotate X-axis labels
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
              <option key={i + 1} value={i + 1}>{i + 1}</option>
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

      {/* Render the Line Chart */}
      <Line data={chartData} options={chartOptions} />
    </Container>
  );
};

export default ComparisonGraph;
