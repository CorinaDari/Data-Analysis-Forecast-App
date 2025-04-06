import React, { useEffect, useState, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalForm from "./modalSI";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const SalesHistogram = () => {
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customerGender, setCustomerGender] = useState("");
    const [barLineData, setBarLineData] = useState({});
    const [pieData, setPieData] = useState({});
    const [subCategoryData, setSubCategoryData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [csvjson, setCsvjson] = useState([]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/csvjson.json`);
            const salesData = await response.json();
            setCsvjson(salesData);
            const filteredData = salesData.filter((sale) => {
                const saleDate = new Date(sale.Date);
                const matchesDate = saleDate.getFullYear() === selectedDate.getFullYear() &&
                    saleDate.getMonth() === selectedDate.getMonth();
                const matchesGender = customerGender ? sale["Customer Gender"] === customerGender : true;
                return matchesDate && matchesGender;
            });

            const groupedData = groupSalesData(filteredData);
            setBarLineData(groupedData.barLineData);
            setPieData(groupedData.pieData);
            setLoading(false);
        } catch (error) {
            console.error("Error reading data from JSON:", error);
            setLoading(false);
        }
    };

    const groupSalesData = (data) => {
        const grouped = {};
        const categoryCounts = {};

        data.forEach((sale) => {
            const { "Product Type": productType, "Total Sale": totalSale, "Customer Category": customerCategory } = sale;
            if (!grouped[productType]) {
                grouped[productType] = 0;
            }
            grouped[productType] += totalSale;

            if (!categoryCounts[customerCategory]) {
                categoryCounts[customerCategory] = 0;
            }
            categoryCounts[customerCategory] += 1;
        });

        let maxSaleValue = -Infinity;
        let minSaleValue = Infinity;
        let maxSaleInfo = null;
        let minSaleInfo = null;

        for (const [productType, total] of Object.entries(grouped)) {
            if (total > maxSaleValue) {
                maxSaleValue = total;
                maxSaleInfo = { productType, total };
            }
            if (total < minSaleValue) {
                minSaleValue = total;
                minSaleInfo = { productType, total };
            }
        }

        const labels = Object.keys(grouped);
        const values = Object.values(grouped);

        return {
            barLineData: {
                labels,
                datasets: [
                    {
                        type: "bar",
                        label: "Total Sales (Bar)",
                        data: values,
                        backgroundColor: values.map((value) =>
                            value === maxSaleValue ? "rgba(173, 235, 173, 0.8)" :
                            value === minSaleValue ? "rgba(255, 173, 173, 0.8)" :
                            "rgba(173, 216, 230, 0.6)"
                        ),
                    },
                    {
                        type: "line",
                        label: "Total Sales (Line)",
                        data: values,
                        borderColor: "rgba(144, 202, 249, 0.8)",
                        borderWidth: 2,
                        pointBackgroundColor: "rgba(144, 202, 249, 0.8)",
                        fill: false,
                    }
                ],
            },
            pieData: {
                labels: Object.keys(categoryCounts),
                datasets: [
                    {
                        data: Object.values(categoryCounts),
                        backgroundColor: [
                            "rgba(255, 179, 186, 0.6)",
                            "rgba(255, 223, 186, 0.6)",
                            "rgba(255, 255, 186, 0.6)",
                            "rgba(186, 255, 201, 0.6)",
                        ],
                    },
                ],
            },
            maxSaleInfo,
            minSaleInfo,
        };
    };

    const fetchSubCategoryData = async (categoryName) => {
        const response = await fetch(`${process.env.PUBLIC_URL}/csvjson.json`);
        const salesData = await response.json();
        const subCategoryData = salesData.filter(sale => sale["Product Type"] === categoryName);
    
        const subCategoryGrouped = {};
        subCategoryData.forEach((sale) => {
            const subCategory = sale["Product Subtype"];
            if (!subCategoryGrouped[subCategory]) {
                subCategoryGrouped[subCategory] = 0;
            }
            subCategoryGrouped[subCategory] += sale["Total Sale"];
        });
        const subCategoryValues = Object.values(subCategoryGrouped);
    const maxSubCategoryValue = Math.max(...subCategoryValues);
    const minSubCategoryValue = Math.min(...subCategoryValues);

    setSubCategoryData({
        labels: Object.keys(subCategoryGrouped),
        datasets: [
            {
                type: "bar",
                label: `Sales for ${categoryName} (Bar)`,
                data: subCategoryValues,
                backgroundColor: subCategoryValues.map(value => 
                    value === maxSubCategoryValue ? "rgba(173, 235, 173, 0.8)" : // Verde pentru maxim
                    value === minSubCategoryValue ? "rgba(255, 173, 173, 0.8)" : // Roșu pentru minim
                    "rgba(144, 202, 249, 0.8)" // Albastru pentru restul
                ),
            },
            {
                type: "line",
                label: `Sales for ${categoryName} (Line)`,
                data: subCategoryValues,
                borderColor: "rgba(144, 202, 249, 0.8)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(144, 202, 249, 0.8)",
                fill: false,
            },
        ],
    });
};

    const handleBarClick = (event, elements) => {
        if (elements.length > 0) {
            const categoryIndex = elements[0].index;
            const categoryName = barLineData.labels[categoryIndex];
            setSelectedCategory(categoryName);
            fetchSubCategoryData(categoryName);
    
            
            const element = elements[0].element;
            const elementPosition = element.getCenterPoint();
    
          
            const tooltipX = elementPosition.x - 50; 
            const tooltipY = elementPosition.y - 80; 
    
            setTooltipPosition({ top: tooltipY, left: tooltipX });
            setTooltipVisible(true);
        }
    };
    

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setTooltipVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExportExcel = async (filters) => {
        console.log("Filters sent to backend:", filters); // Adaugă acest log
        try {
            const response = await fetch('http://localhost:5000/api/excel/generate-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });
            if (!response.ok) {
                throw new Error('Failed to export Excel file');
            }
    
            const data = await response.json();
            console.log("Excel file generated:", data);
        } catch (error) {
            console.error("Error exporting Excel:", error);
        }
    };
    
    

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    useEffect(() => {
        fetchSalesData();
    }, [selectedDate, customerGender]);

    if (loading) return <p>Loading data...</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
            <h2>Sales Dashboard</h2>

            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                customInput={<input type="text" style={{ padding: "8px", borderRadius: "5px", marginBottom: "10px" }} />}
            />

            <select
                value={customerGender}
                onChange={(e) => setCustomerGender(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", marginBottom: "10px" }}
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
                <div>  </div>
            <button
                style={{
                    padding: "10px 20px",
                    backgroundColor: "blue",
                    color: "white",
                    borderRadius: "5px",
                }}
                onClick={toggleModal}
            >
               Export?
            </button>

            {/* Integrează componenta ModalForm */}
            <ModalForm
                isOpen={isModalOpen}
                onClose={toggleModal}
                onExportExcel={handleExportExcel}
                jsonData={csvjson}
            />
            <div style={{ width: "100%", marginBottom: "20px" }}>
                {barLineData.labels && barLineData.labels.length > 0 ? (
                    <Bar
                        data={barLineData}
                        options={{
                            onClick: handleBarClick,
                            responsive: true,
                            scales: { y: { beginAtZero: true } },
                        }}
                    />
                ) : (
                    <p>No data for selected date and gender.</p>
                )}
            </div>

            {tooltipVisible && subCategoryData && (
    <div
        ref={tooltipRef}
        style={{
            position: "absolute",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            background: "white",
            padding: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "5px",
            zIndex: 10,
            width: "300px", 
            height: "250px", 
            overflowY: "auto", 
        }}
    >
        <h4>Sales by Subcategory for {selectedCategory}</h4>
        <Bar
            data={subCategoryData}
            options={{
                responsive: true,
                maintainAspectRatio: false, 
                scales: { y: { beginAtZero: true } },
            }}
            height={300} 
        />
    </div>
)}

            <div style={{ width: "300px", height: "300px", marginBottom: "20px" }}>
                <h3>Customer Category Breakdown</h3>
                {pieData.labels && pieData.labels.length > 0 ? (
                    <Pie data={pieData} />
                ) : (
                    <p>No data available for pie chart.</p>
                )}

        </div>
        </div>
    );
};

export default SalesHistogram;
