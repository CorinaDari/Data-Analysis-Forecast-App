import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ModalForm = ({ isOpen, onClose, onExportExcel, jsonData }) => {
    const [yearAndMonth, setYearAndMonth] = useState(null);
    const [productCategory, setProductCategory] = useState("");
    const [gender, setGender] = useState("");
    const [region, setRegion] = useState("");

    // Multiple marje de eroare
    const [errorMargins, setErrorMargins] = useState([
        { id: "highIncrease", label: "High Increase (▲)", max: 20 },
        { id: "moderateIncrease", label: "Moderate Increase (⇧)", max: 10 },
        { id: "neutral", label: "Neutral (➔)", max: -10 },
        { id: "moderateDecrease", label: "Moderate Decrease (⇩)", max: -20 },
        { id: "highDecrease", label: "High Decrease (▼)", max: -Infinity },
    ]);

    const [uniqueYears, setUniqueYears] = useState([]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [uniqueRegions, setUniqueRegions] = useState([]);

    useEffect(() => {
        if (jsonData && jsonData.length > 0) {
            const years = [...new Set(jsonData.map((item) => item.Year))];
            const categories = [...new Set(jsonData.map((item) => item["Product Type"]))];
            const regions = [...new Set(jsonData.map((item) => item.Region))];

            setUniqueYears(years);
            setUniqueCategories(categories);
            setUniqueRegions(regions);
        }
    }, [jsonData]);

    const handleExport = async () => {
        const filters = {
            year: yearAndMonth ? yearAndMonth.getFullYear() : null,
            month: yearAndMonth ? yearAndMonth.getMonth() + 1 : null,
            productCategory,
            gender,
            region,
            errorMargins: errorMargins.map((margin) => ({
                id: margin.id,
                max: margin.max,
            })), // Trimite lista de marje
        };
    
        try {
            const response = await fetch("http://localhost:5000/api/excel/generate-excel", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });
            
    
            if (response.ok) {
                const { path } = await response.json();
                console.log("Excel file generated at:", path);
                alert("Excel file generated successfully!");
            } else {
                console.error("Failed to generate Excel file");
                alert("Error generating Excel file");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An unexpected error occurred");
        }
    
        onClose();
    };
    
    const updateErrorMargin = (id, value) => {
        setErrorMargins((prevMargins) =>
            prevMargins.map((margin, index) => {
                if (margin.id === id) {
                    const newMax = parseFloat(value) || -Infinity;

                    // Ajustare automată a intervalelor pentru următoarele categorii
                    const updatedMargins = [...prevMargins];
                    updatedMargins[index] = { ...margin, max: newMax };

                    if (index + 1 < prevMargins.length) {
                        updatedMargins[index + 1] = {
                            ...prevMargins[index + 1],
                            max: Math.min(newMax, prevMargins[index + 1].max),
                        };
                    }
                    return updatedMargins[index];
                }
                return margin;
            })
        );
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                maxHeight: "90vh",
                overflowY: "auto", // Adaugăm scrollbar dacă e nevoie
            }}
        >
            <h3>Export Options</h3>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Year:</label>
                <DatePicker
                    selected={yearAndMonth}
                    onChange={(date) => setYearAndMonth(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Select Year and Month"
                    customInput={
                        <input
                            type="text"
                            style={{
                                padding: "8px",
                                borderRadius: "5px",
                                width: "100%",
                            }}
                        />
                    }
                />
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Product Category:</label>
                <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", width: "100%" }}
                >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Gender:</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                    <label>
                        <input
                            type="radio"
                            value="Male"
                            checked={gender === "Male"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Male
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="Female"
                            checked={gender === "Female"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Female
                    </label>
                    <label>
                        <input
                            type="radio"
                            value=""
                            checked={gender === ""}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Any
                    </label>
                </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Region:</label>
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", width: "100%" }}
                >
                    <option value="">All Regions</option>
                    {uniqueRegions.map((region) => (
                        <option key={region} value={region}>
                            {region}
                        </option>
                    ))}
                </select>
            </div>

            {/* Adaugăm marjele de eroare */}
            <div style={{ marginTop: "20px" }}>
                <h4>Set Error Margins:</h4>
                {errorMargins.map((margin) => (
                    <div key={margin.id} style={{ marginBottom: "10px" }}>
                        <label>{margin.label}:</label>
                        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                            <input
                                type="number"
                                placeholder="Max"
                                value={margin.max !== -Infinity ? margin.max : ""}
                                onChange={(e) => updateErrorMargin(margin.id, e.target.value)}
                                style={{ padding: "8px", borderRadius: "5px", width: "100%" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                    onClick={handleExport}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "blue",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Export
                </button>
                <button
                    onClick={onClose}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "gray",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ModalForm;
