import React, { useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as d3 from "d3-scale";
import { interpolateReds } from "d3-scale-chromatic";
import Papa from "papaparse";  // Importing PapaParse for CSV parsing
import phMap from '../ph.json'; // Import the GeoJSON file for the Philippine map

const MapWrapper = () => {
  const mapRef = useRef(null);
  const [choroplethData, setChoroplethData] = useState({});
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    setGeoData(phMap); // Load GeoJSON data

    // Fetch CSV Data
    const fetchCSVData = async () => {
      try {
        const response = await fetch("/dataset.csv"); // Fetch the CSV from the public directory
        const csvText = await response.text(); // Get the raw CSV text
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { data } = results;

            const aggregatedData = data.reduce((acc, row) => {
              const region = row.Region.trim();
              const cases = parseInt(row.cases) || 0;
              const deaths = parseInt(row.deaths) || 0;
              acc[region] = acc[region]
                ? {
                    cases: acc[region].cases + cases,
                    deaths: acc[region].deaths + deaths,
                  }
                : { cases, deaths };
              return acc;
            }, {});

            setChoroplethData(aggregatedData); // Update the choroplethData with aggregated CSV data
          },
        });
      } catch (error) {
        console.error("Error fetching CSV data:", error);
      }
    };

    fetchCSVData();
  }, []); // Run only once when the component mounts

  useEffect(() => {
    if (!mapRef.current || !geoData || Object.keys(choroplethData).length === 0) return;

    const map = L.map(mapRef.current, {
      center: [12.8797, 121.7740],
      zoom: 6,
    });

    // Use a clean tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    const maxCases = Math.max(...Object.values(choroplethData).map(d => d.cases));
    const colorScale = d3.scaleSequential(interpolateReds).domain([0, maxCases]);

    const style = (feature) => {
      const region = feature.properties.name.trim();
      const cases = choroplethData[region]?.cases || 0;
      return {
        fillColor: colorScale(cases),
        weight: 2, // Increased border weight for emphasis
        color: "black", // Border color for highlighting
        opacity: 1,
        dashArray: "3",
        fillOpacity: 0.7,
      };
    };

    const onEachFeature = (feature, layer) => {
      const region = feature.properties.name.trim();
      const data = choroplethData[region] || { cases: 0, deaths: 0 };
      layer.bindPopup(`
        <b>${region}</b><br>
        Total Cases: ${data.cases}<br>
        Total Deaths: ${data.deaths}
      `);

      // Highlight region on mouse hover
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: "666",
            fillOpacity: 0.9,
          });
          layer.bringToFront();
        },
        mouseout: (e) => {
          geoJson.resetStyle(e.target); // Reset to default style
        },
      });
    };

    const geoJson = L.geoJSON(geoData, {
      style,
      onEachFeature,
    }).addTo(map);

    return () => {
      if (map) map.remove();
    };
  }, [choroplethData, geoData]);

  return <div style={{ height: "400px", width: "750px",  border: 'none'}} ref={mapRef}></div>;
};

function Map() {
  return (
    <div className="content">
      <Row>
        <Col md="12">
              <MapWrapper />
        </Col>
      </Row>
    </div>
  );
}

export default Map;
