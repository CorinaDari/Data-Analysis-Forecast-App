import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";  // Import useNavigate for routing
import { Pie, Doughnut, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SalesAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [chartType, setChartType] = useState("Pie");
  const [salesData, setSalesData] = useState([]);

  const navigate = useNavigate();  // Initialize the navigation function

  useEffect(() => {
    const loadJsonData = async () => {
      try {
        const response = await fetch("/csvjson.json");
        const jsonData = await response.json();
        setSalesData(jsonData);
      } catch (error) {
        console.error("Error loading JSON data:", error);
      }
    };

    loadJsonData();
  }, []);

  const fetchDataByType = () => {
    setLoading(true);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;

    const filteredData = {};
    const typesSet = new Set();

    salesData.forEach((sale) => {
      if (sale.Year === selectedYear && sale.Month === selectedMonth) {
        const productType = sale["Product Type"];
        const totalSale = sale["Total Sale"];

        if (productType && totalSale) {
          filteredData[productType] = (filteredData[productType] || 0) + totalSale;
          typesSet.add(productType);
        }
      }
    });

    if (Object.keys(filteredData).length === 0) {
      setData(null); 
    } else {
      const chartData = {
        labels: Object.keys(filteredData),
        datasets: [
          {
            label: "Sales by product type",
            data: Object.values(filteredData),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#FFA500", "#FF4500", "#32CD32", "#8B4513", "#FF69B4"],
          },
        ],
      };

      setData(chartData);
    }

    setProductTypes(Array.from(typesSet));
    setLoading(false);
  };

  const fetchDataBySubtype = (productType) => {
    setLoading(true);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;

    const filteredData = {};

    salesData.forEach((sale) => {
      if (sale.Year === selectedYear && sale.Month === selectedMonth && sale["Product Type"] === productType) {
        const productSubtype = sale["Product Subtype"];
        const totalSale = sale["Total Sale"];

        if (productSubtype && totalSale) {
          filteredData[productSubtype] = (filteredData[productSubtype] || 0) + totalSale;
        }
      }
    });

    if (Object.keys(filteredData).length === 0) {
      setData(null); 
    } else {
      const chartData = {
        labels: Object.keys(filteredData),
        datasets: [
          {
            label: `Sales by Subtype for ${productType}`,
            data: Object.values(filteredData),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#FFA500", "#FF4500", "#32CD32", "#8B4513", "#FF69B4"],
          },
        ],
      };

      setData(chartData);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (salesData.length > 0) {
      fetchDataByType();
    }
  }, [selectedDate, salesData]);

  useEffect(() => {
    if (salesData.length > 0) {
      if (selectedProductType) {
        fetchDataBySubtype(selectedProductType);
      } else {
        fetchDataByType();
      }
    }
  }, [selectedProductType, salesData]);

  const handleOpenCartograma = () => {
    navigate("/cartograma");  // Navigate to the Cartograma page
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Product sales analysis</h2>
      
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        showFullMonthYearPicker
        customInput={
          <input
            type="text"
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
          />
        }
      />

      <select
        value={selectedProductType || ""}
        onChange={(e) => setSelectedProductType(e.target.value || null)}
        style={{ marginTop: "10px", padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
      >
        <option value="">Pick a product</option>
        {productTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <div style={{ marginTop: "20px" }}>
        <label>
          <input
            type="radio"
            value="Pie"
            checked={chartType === "Pie"}
            onChange={(e) => setChartType(e.target.value)}
          /> Pie
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            value="Doughnut"
            checked={chartType === "Doughnut"}
            onChange={(e) => setChartType(e.target.value)}
          /> Doughnut
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            value="Bar"
            checked={chartType === "Bar"}
            onChange={(e) => setChartType(e.target.value)}
          /> Bar
        </label>
      </div>

      <div style={{ width: "400px", marginTop: "20px" }}>
        {data ? (
          chartType === "Pie" ? (
            <Pie data={data} />
          ) : chartType === "Doughnut" ? (
            <Doughnut data={data} />
          ) : (
            <Bar data={data} />
          )
        ) : (
          <p>Data not available.</p>
        )}
      </div>

      {/* Button to open Cartograma */}
      <button style={{ marginTop: "20px", padding: "10px 20px" }} onClick={handleOpenCartograma}>
        Open Cartograma
      </button>
    </div>
  );
};

export default SalesAnalysis;
