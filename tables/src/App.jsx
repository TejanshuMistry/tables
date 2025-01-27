import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TablesPage from "./TablesPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TablesPage />} />
      </Routes>
    </Router>
  );
};

export default App;