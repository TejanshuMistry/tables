import React, { useState, useEffect } from "react";

const TablesPage = () => {
  const [tablesData, setTablesData] = useState([]);
  const [minValues, setMinValues] = useState([]);

  // WebSocket initialization
  useEffect(() => {
    const socket = new WebSocket("ws://0.tcp.in.ngrok.io:16029");

    socket.onmessage = (event) => {
      const jsonData = JSON.parse(event.data);
      console.log(jsonData);
      const tableRows = Object.entries(jsonData).map(([machine, columns]) => {
        return Object.values(columns);
      });

      setTablesData(tableRows);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => socket.close();
  }, []);

  // Calculate minimum values for each table
  useEffect(() => {
    const calculateMinValues = () => {
      const minVals = tablesData.map((row) =>
        row.length > 0 ? Math.min(...row) : null // Check for valid rows
      );
      setMinValues(minVals);
    };

    if (tablesData.length > 0) {
      calculateMinValues();
    }
  }, [tablesData]);

  return (
    <div style={{ padding: "20px" }}>
      {tablesData.map((row, tableIndex) => (
        <div key={tableIndex} style={{ marginBottom: "30px" }}>
          <h3>Table {tableIndex + 1}</h3>
          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                {row.map((_, colIndex) => (
                  <th key={colIndex}>Column {colIndex + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: "10px" }}>
            <label>
              Minimum:
              <input
                type="text"
                value={minValues[tableIndex] !== null ? minValues[tableIndex] : ""}
                readOnly
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TablesPage;