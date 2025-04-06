import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Button } from "@mui/material";
import ExportModal from "./ExportModal"; // Importăm modalul separat

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ForecastingModel = () => {
    const [salesData, setSalesData] = useState([]);
    const [region, setRegion] = useState("Moldova");
    const [filteredSales, setFilteredSales] = useState([]);
    const [showModal, setShowModal] = useState(false); // Controlăm modalul

    const fetchSalesData = async () => {
        try {
            const response = await fetch("/csvjson.json");
            const data = await response.json();
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    useEffect(() => {
        const filtered = salesData.filter((sale) => sale.Region === region);
        setFilteredSales(filtered);
    }, [salesData, region]);

    const calculateLinearRegression = () => {
        const monthlySales = Array(12).fill(0);
        const years = [2019, 2020, 2021, 2022, 2023];

        filteredSales.forEach((sale) => {
            const month = sale.Month - 1;
            monthlySales[month] += sale["Total Sale"];
        });

        if (monthlySales.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const meanY = monthlySales.reduce((a, b) => a + b) / monthlySales.length;

        const m =
            monthlySales.reduce((acc, curr, idx) => acc + idx * curr, 0) /
            monthlySales.reduce((acc, curr) => acc + Math.pow(curr, 2), 0);
        const b = meanY - (m * (monthlySales.length - 1)) / 2;

        const predictedSales = [];
        const futureMonths = Array.from({ length: 24 }, (_, i) => 12 + i + 1);
        futureMonths.forEach((month) => {
            predictedSales.push(m * month + b);
        });

        const extendedLabels = years.flatMap((year) => [year]);
        extendedLabels.push(2024, 2025);

        return {
            labels: extendedLabels,
            datasets: [
                {
                    label: "Total Sales",
                    data: monthlySales.slice(0, 5),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.4)",
                    tension: 0.2,
                },
                {
                    label: "Forecast",
                    data: [...monthlySales.slice(0, 5), ...predictedSales],
                    borderColor: "rgba(255,99,132,1)",
                    backgroundColor: "rgba(255,99,132,0.4)",
                    tension: 0.2,
                    fill: false,
                    borderWidth: 3,
                },
            ],
        };
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center" }}>Sales Forecast by Region</h2>

            {/* Dropdown pentru regiuni */}
            <div>
                <label>Region: </label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="Moldova">Moldova</option>
                    <option value="Banat">Banat</option>
                    <option value="Dobrogea">Dobrogea</option>
                    <option value="Oltenia">Oltenia</option>
                    <option value="Ardeal">Ardeal</option>
                </select>
            </div>

            {/* Graficul */}
            <div style={{ marginTop: "20px" }}>
                <Line
                    data={calculateLinearRegression()}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                title: { display: true, text: "Years" },
                                ticks: {
                                    autoSkip: false,
                                },
                            },
                            y: {
                                min: 0,
                                max: 300000,
                                title: { display: true, text: "Total Sales ($)" },
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </div>

            {/* Butonul pentru deschiderea modalului */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Button variant="contained" onClick={() => setShowModal(true)}>
                    Export to Excel
                </Button>
            </div>

            {/* Modalul pentru export */}
            <ExportModal
                open={showModal}
                handleClose={() => setShowModal(false)}
                salesData={salesData}
                region={region}
            />
        </div>
    );
};

export default ForecastingModel;
