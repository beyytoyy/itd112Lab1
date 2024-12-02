import React from "react";
import AddDengueData from "../src/components/AddDengueData";
import DengueDataList from "../src/components/DengueDataList";
// import CsvUploader from "./CsvUploader"; // Uncomment this if you implement CSV upload

function App() {
  return (
    <div className="App">
      <h1>Dengue Data CRUD App</h1>
      <AddDengueData />
      {/* <CsvUploader /> Uncomment this if you implement CSV upload */}
      <DengueDataList /> 
    </div>
  );
}

export default App;
