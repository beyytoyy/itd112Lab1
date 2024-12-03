import React, { useState, useEffect } from "react";
import { Table, Button, Container, Row, Col, Form, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse"; // For CSV parsing
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";  // Firebase setup

const DengueDataList = () => {
  const [dengueData, setDengueData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    loc: "",
    cases: "",
    deaths: "",
    date: "",
    Region: "",
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAlert, setShowAlert] = useState({ type: "", message: "" });

  // Show alerts
  const showAlertMessage = (type, message) => {
    setShowAlert({ type, message });
    setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
  };

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dengueData"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDengueData(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };
    fetchData();
  }, []);

  // Handle deleting data from Firebase
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "dengueData", id));
      setDengueData(prevData => prevData.filter((data) => data.id !== id));
      showAlertMessage("success", "Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting data:", error);
      showAlertMessage("danger", "Error deleting data.");
    }
  };

  // Handle editing data
  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      loc: data.loc,
      cases: data.cases,
      deaths: data.deaths,
      date: data.date,
      Region: data.Region,
    });
  };

  // Handle updating data
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "dengueData", editingId), editForm);
      setDengueData(prevData =>
        prevData.map((data) =>
          data.id === editingId ? { id: editingId, ...editForm } : data
        )
      );
      setEditingId(null);
      showAlertMessage("success", "Data updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
      showAlertMessage("danger", "Error updating data.");
    }
  };

  // Handle uploading CSV and saving to Firebase
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const newData = results.data;
          try {
            const batch = [];
            for (const item of newData) {
              batch.push(
                addDoc(collection(db, "dengueData"), item) // Add each record to Firestore
              );
            }
            await Promise.all(batch); // Wait for all records to be added
            setDengueData(prevData => [...prevData, ...newData]);
            showAlertMessage("success", "CSV file uploaded and data added to Firebase successfully!");
          } catch (error) {
            showAlertMessage("danger", "Error uploading CSV to Firebase.");
            console.error("CSV upload error:", error);
          }
        },
        error: (error) => {
          showAlertMessage("danger", "Error parsing CSV file.");
          console.error("CSV parse error:", error);
        },
      });
    }
  };

  // Filter data based on search term
  const filteredData = dengueData.filter((data) =>
    data.loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / dataPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * dataPerPage,
    currentPage * dataPerPage
  );

  return (
    <Container className="mt-4">
      {/* Alert */}
      {showAlert.message && (
        <Alert variant={showAlert.type} className="text-center">
          {showAlert.message}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <h3>Dengue Data List</h3>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Form.Group>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleCSVUpload} // Bind the CSV upload handler
              className="mb-2"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Search and filters */}
      <Container style={{ background: "#e8e9eb", padding: "20px", borderRadius: "5px" }}>
        <Row className="mb-4">
          <Col className="d-flex justify-content-end">
            <Form.Control
              type="text"
              placeholder="Search by Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "20%" }}
            />
          </Col>
        </Row>

        {editingId ? (
          <Form onSubmit={handleUpdate} className="mb-4">
            <h4>Edit Entry</h4>
            {Object.keys(editForm).map((key) => (
              <Form.Group key={key} className="mb-2">
                <Form.Label>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editForm[key]}
                  onChange={(e) =>
                    setEditForm({ ...editForm, [key]: e.target.value })
                  }
                  required
                />
              </Form.Group>
            ))}
            <Button type="submit" variant="success" className="me-2">
              Update Data
            </Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </Form>
        ) : (
          <Table striped bordered hover className="text-center mt-3">
            <thead>
              <tr>
                <th>Location</th>
                <th>Cases</th>
                <th>Deaths</th>
                <th>Date</th>
                <th>Region</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((data) => (
                <tr key={data.id}>
                  <td>{data.loc}</td>
                  <td>{data.cases}</td>
                  <td>{data.deaths}</td>
                  <td>{data.date}</td>
                  <td>{data.Region}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEdit(data)}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(data.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Pagination controls */}
        <Row className="mt-3">
          <Col md={6} className="d-flex align-items-center">
            <span className="me-2">Show:</span>
            <Form.Select
              value={dataPerPage}
              onChange={(e) => setDataPerPage(Number(e.target.value))}
              style={{ width: "80px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </Form.Select>
            <span style={{ marginLeft: "5px" }}>
              of <strong>{dengueData.length}</strong> entries
            </span>
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
            <Button
              variant="primary"
              className="me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="me-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default DengueDataList;
