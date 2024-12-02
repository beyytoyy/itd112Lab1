import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { Table, Button, Container, Row, Col, Form } from 'react-bootstrap';
import Papa from 'papaparse'; // Import Papa for CSV parsing

const DengueDataList = () => {
  const [dengueData, setDengueData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const dengueSnapshot = await getDocs(dengueCollection);
      const dataList = dengueSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDengueData(dataList);
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id);
    try {
      await deleteDoc(dengueDocRef);
      setDengueData(dengueData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: data.date,
      regions: data.regions,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);
    try {
      await updateDoc(dengueDocRef, {
        location: editForm.location,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: editForm.date,
        regions: editForm.regions,
      });
      setDengueData(dengueData.map((data) =>
        data.id === editingId ? { id: editingId, ...editForm } : data
      ));
      setEditingId(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]; // Get the file
    if (file) {
      Papa.parse(file, {
        header: true, // Assumes the first row contains headers
        skipEmptyLines: true,
        complete: async function (results) {
          // Remove the first two lines which are not needed
          const filteredData = results.data.slice(2).map((row) => ({
            location: row['loc'] || row['#adm2+name'],
            cases: Number(row['cases'] || row['#affected+infected']),
            deaths: Number(row['deaths'] || row['#affected+killed']),
            date: row['date'] || row['#date'],
            regions: row['Region'] || row['#region'],
          }));

          // Filter out rows where any required field is missing
          const cleanedData = filteredData.filter(row =>
            row.location && !isNaN(row.cases) && !isNaN(row.deaths) && row.date && row.regions
          );

          try {
            const batch = writeBatch(db); // Use Firestore batch operations for efficiency
            cleanedData.forEach(data => {
              const docRef = doc(collection(db, "dengueData")); // Create a new document reference
              batch.set(docRef, data); // Add each data object to Firestore
            });

            await batch.commit();
            setDengueData([...dengueData, ...cleanedData]); // Update the state with the new data
            alert("CSV file successfully uploaded and processed!");
          } catch (error) {
            console.error("Error uploading data: ", error);
          }
        },
        error: function (error) {
          console.error("Error parsing CSV file: ", error);
        },
      });
    }
  };

  return (
    <Container>
      <Row className="mt-3 mb-2">
        <Col className="d-flex justify-content-end">
          <Form.Group>
            <Form.Control
              type="file"
              id="csvUpload"
              accept=".csv"
              onChange={handleCSVUpload}
            />
          </Form.Group>
        </Col>
      </Row>

      {editingId ? (
        <form onSubmit={handleUpdate}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="number"
              placeholder="Cases"
              value={editForm.cases}
              onChange={(e) => setEditForm({ ...editForm, cases: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="number"
              placeholder="Deaths"
              value={editForm.deaths}
              onChange={(e) => setEditForm({ ...editForm, deaths: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="date"
              placeholder="Date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Regions"
              value={editForm.regions}
              onChange={(e) => setEditForm({ ...editForm, regions: e.target.value })}
              required
            />
          </Form.Group>
          <Button type="submit" variant="success" className="mt-2">Update Data</Button>
          <Button variant="secondary" onClick={() => setEditingId(null)} className="mt-2 ml-2">Cancel</Button>
        </form>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Location</th>
              <th>Cases</th>
              <th>Deaths</th>
              <th>Date</th>
              <th>Regions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dengueData.map((data, index) => (
              <tr key={index}>
                <td>{data.location}</td>
                <td>{data.cases}</td>
                <td>{data.deaths}</td>
                <td>{data.date}</td>
                <td>{data.regions}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(data)}>Edit</Button>{" "}
                  <Button variant="danger" onClick={() => handleDelete(data.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DengueDataList;
