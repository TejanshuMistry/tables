import React, { useState, useEffect } from "react";

const TablesPage = () => {
  const [tablesData, setTablesData] = useState({});
  const [minValues, setMinValues] = useState({});
  const [sumTable, setSumTable] = useState([]);
  const [sumMinValues, setSumMinValues] = useState([]);

  // WebSocket initialization
  useEffect(() => {
    const socket = new WebSocket("ws://0.tcp.in.ngrok.io:13389");

    socket.onmessage = (event) => {
      try {
        console.log("Raw event data:", event.data);

        const jsonData = JSON.parse(event.data);
        console.log("Parsed JSON:", jsonData);

        const newTablesData = {};
        const newMinValues = {};

        Object.entries(jsonData).forEach(([machine, valuesArray]) => {
          if (Array.isArray(valuesArray)) {
            newTablesData[machine] = valuesArray;

            // Find the four smallest values for each machine
            newMinValues[machine] = [...valuesArray].sort((a, b) => a - b).slice(0, 4);
          } else {
            console.error("Unexpected data format for", machine, valuesArray);
          }
        });

        setTablesData(newTablesData);
        setMinValues(newMinValues);

        // Compute the sum table if there are exactly two machines
        const machineValues = Object.values(newTablesData);
        if (machineValues.length === 2) {
          const summedTable = machineValues[0].map((val, index) =>
            (machineValues[1][index] || 0) + val
          );

          // Find the 4 smallest values in the sum table
          const sumMinVals = [...summedTable].sort((a, b) => a - b).slice(0, 4);
          setSumTable(summedTable);
          setSumMinValues(sumMinVals);
        } else {
          setSumTable([]);
          setSumMinValues([]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => socket.close();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/* Individual Machine Tables */}
      {Object.entries(tablesData).map(([machine, row]) => (
        <div key={machine} style={{ marginBottom: "30px" }}>
          <h3>{machine}</h3>
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
                  <td
                    key={cellIndex}
                    style={{
                      backgroundColor: minValues[machine]?.includes(cell) ? "lightgreen" : "white",
                      fontWeight: minValues[machine]?.includes(cell) ? "bold" : "normal",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* Sum Table */}
      {sumTable.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Summed Table</h3>
          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                {sumTable.map((_, colIndex) => (
                  <th key={colIndex}>Column {colIndex + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {sumTable.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      backgroundColor: sumMinValues.includes(cell) ? "lightgreen" : "white",
                      fontWeight: sumMinValues.includes(cell) ? "bold" : "normal",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablesPage;