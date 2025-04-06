const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { exec } = require("child_process");

const getFilteredData = (filters) => {
    const rawDataPath = path.join(__dirname, "../csvjson.json");

    if (!fs.existsSync(rawDataPath)) {
        throw new Error("File csvjson.json doesn't exist.");
    }

    const rawData = fs.readFileSync(rawDataPath);
    const salesData = JSON.parse(rawData);

    let filteredData = salesData;

    if (filters.year && filters.month) {
        filteredData = filteredData.filter((sale) => {
            const saleYear = parseInt(sale.Year);
            const saleMonth = parseInt(sale.Month);
            return saleYear === parseInt(filters.year) && saleMonth === parseInt(filters.month);
        });
    }

    if (filters.productCategory) {
        filteredData = filteredData.filter((sale) =>
            sale["Product Type"].toLowerCase() === filters.productCategory.toLowerCase()
        );
    }

    if (filters.gender) {
        filteredData = filteredData.filter((sale) =>
            sale["Customer Gender"].toLowerCase() === filters.gender.toLowerCase()
        );
    }

    if (filters.region) {
        filteredData = filteredData.filter((sale) =>
            sale.Region.toLowerCase() === filters.region.toLowerCase()
        );
    }
    if (filters.errorMargins) {
        const margins = filters.errorMargins; // Lista marjelor primită din frontend
        filteredData = filteredData.filter((sale) => {
            const salesChange = parseFloat(sale["Sales Change (%)"]) || 0;
    
            // Verificăm dacă valoarea `Sales Change (%)` se încadrează în oricare dintre marje
            for (let i = 0; i < margins.length; i++) {
                const margin = margins[i];
                const nextMargin = margins[i + 1] || { max: -Infinity }; // Ultima marjă devine limita inferioară
    
                if (salesChange <= margin.max && salesChange > nextMargin.max) {
                    return true; // Valoarea este validă pentru această marjă
                }
            }
            return false; // Nu s-a potrivit cu niciuna din marje
        });
    }
    
    

    return filteredData;
};

const calculateExtremes = (worksheet) => {
    let maxSalesAmount = Number.NEGATIVE_INFINITY;
    let minSalesAmount = Number.POSITIVE_INFINITY;
    let maxTotalSale = Number.NEGATIVE_INFINITY;
    let minTotalSale = Number.POSITIVE_INFINITY;
    let maxQuantitySold = Number.NEGATIVE_INFINITY;

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const salesAmount = parseFloat(row.getCell("Sales Amount").value) || 0;
        const totalSale = parseFloat(row.getCell("Total Sale").value) || 0;
        const quantitySold = parseFloat(row.getCell("Quantity Sold").value) || 0;

        maxSalesAmount = Math.max(maxSalesAmount, salesAmount);
        minSalesAmount = Math.min(minSalesAmount, salesAmount);
        maxTotalSale = Math.max(maxTotalSale, totalSale);
        minTotalSale = Math.min(minTotalSale, totalSale);
        maxQuantitySold = Math.max(maxQuantitySold, quantitySold);
    });

    return { maxSalesAmount, minSalesAmount, maxTotalSale, minTotalSale, maxQuantitySold };
};

const addLegendSheet = (workbook) => {
    const legendSheet = workbook.addWorksheet("Legend");

    legendSheet.columns = [
        { header: "Format", key: "Format", width: 30 },
        { header: "Description", key: "Description", width: 50 },
    ];

    const legendData = [
        { Format: "Header Row", Description: "Bold text with blue background." },
        { Format: "Max Total Sale", Description: "Green background and dark green text." },
        { Format: "Min Total Sale", Description: "Red background and dark red text." },
        { Format: "Max Sales Amount", Description: "Light green background in 'Sales Amount' column." },
        { Format: "Min Sales Amount", Description: "Light red background in 'Sales Amount' column." },
        { Format: "Quantity Sold", Description: "Progress bar with quantity appended." },
        { Format: "Sales Change (%) ▲", Description: "Sales increased by more than 20% (dark green background)." },
        { Format: "Sales Change (%) ⇧", Description: "Sales increased between 10% and 20% (light green background)." },
        { Format: "Sales Change (%) ➔", Description: "Sales change within ±10% (yellow background)." },
        { Format: "Sales Change (%) ⇩", Description: "Sales decreased between 10% and 20% (light red background)." },
        { Format: "Sales Change (%) ▼", Description: "Sales decreased by more than 20% (dark red background)." },
    ];

    legendSheet.addRows(legendData);

    legendSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "5B9BD5" } }; // Blue
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });
};

const generateExcelFile = async (filters) => {
    const data = getFilteredData(filters);

    if (data.length === 0) {
        throw new Error("No data matching the filters.");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    worksheet.columns = [
        { header: "Date", key: "Date", width: 20 },
        { header: "Product Type", key: "Product Type", width: 20 },
        { header: "Product Subtype", key: "Product Subtype", width: 20 },
        { header: "Customer Category", key: "Customer Category", width: 20 },
        { header: "Customer Gender", key: "Customer Gender", width: 20 },
        { header: "Age Range", key: "Age Range", width: 20 },
        { header: "Country", key: "Country", width: 20 },
        { header: "Region", key: "Region", width: 20 },
        { header: "Sales Amount", key: "Sales Amount", width: 20 },
        { header: "Quantity Sold", key: "Quantity Sold", width: 20 },
        { header: "Unit Price", key: "Unit Price", width: 20 },
        { header: "Total Sale", key: "Total Sale", width: 20 },
        { header: "Sales Change (%)", key: "Sales Change (%)", width: 20 },
    ];

    worksheet.addRows(data);

    // Header formatting
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "5B9BD5" } }; // Blue
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const extremes = calculateExtremes(worksheet);

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const totalSale = parseFloat(row.getCell("Total Sale").value) || 0;
        const isMaxTotalSale = totalSale === extremes.maxTotalSale;
        const isMinTotalSale = totalSale === extremes.minTotalSale;

        if (isMaxTotalSale) {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C6EFCE" } }; // Light Green
                cell.font = { color: { argb: "006100" } }; // Dark Green text
            });
        } else if (isMinTotalSale) {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC7CE" } }; // Light Red
                cell.font = { color: { argb: "9C0006" } }; // Dark Red text
            });
        }

        const salesAmount = parseFloat(row.getCell("Sales Amount").value) || 0;
        if (!isMaxTotalSale && !isMinTotalSale) {
            if (salesAmount === extremes.maxSalesAmount) {
                row.getCell("Sales Amount").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "D9EAD3" },
                };
                row.getCell("Sales Amount").font = { color: { argb: "006100" } };
            } else if (salesAmount === extremes.minSalesAmount) {
                row.getCell("Sales Amount").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F4CCCC" },
                };
                row.getCell("Sales Amount").font = { color: { argb: "9C0006" } };
            }
        }

        const quantitySold = parseFloat(row.getCell("Quantity Sold").value) || 0;
        const barLength = Math.round((quantitySold / extremes.maxQuantitySold) * 10);
        const progressBar = `${"█".repeat(barLength)}${"▒".repeat(10 - barLength)}`;
        row.getCell("Quantity Sold").value = `${progressBar} ${quantitySold}`;
        row.getCell("Quantity Sold").font = { bold: true, color: { argb: "8A96A0" } };
        row.getCell("Quantity Sold").alignment = { horizontal: "left", vertical: "middle" };

        const salesChange = parseFloat(row.getCell("Sales Change (%)").value) || 0;
        let emoji = "";
        let fillColor = "";

        if (margin) {
            let emoji = "";
            let fillColor = "";
    
            switch (margin.id) {
                case "highIncrease":
                    emoji = "▲";
                    fillColor = "00B050"; // Dark green
                    break;
                case "moderateIncrease":
                    emoji = "⇧";
                    fillColor = "92D050"; // Light green
                    break;
                case "neutral":
                    emoji = "➔";
                    fillColor = "FFFF00"; // Yellow
                    break;
                case "moderateDecrease":
                    emoji = "⇩";
                    fillColor = "FF9A99"; // Light red
                    break;
                case "highDecrease":
                    emoji = "▼";
                    fillColor = "FF0000"; // Dark red
                    break;
                default:
                    break;
            }

            const salesChangeCell = row.getCell("Sales Change (%)");
            salesChangeCell.value = `${emoji} ${salesChange.toFixed(2)}%`;
            salesChangeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
            salesChangeCell.alignment = { horizontal: "center", vertical: "middle" };
        }
    });

    // Add total row
    const totalRow = worksheet.addRow({
        "Date": "Total",
        "Sales Amount": { formula: `SUM(${worksheet.getColumn("Sales Amount").letter}2:${worksheet.getColumn("Sales Amount").letter}${worksheet.rowCount})` },
        "Quantity Sold": { formula: `SUM(${worksheet.getColumn("Quantity Sold").letter}2:${worksheet.getColumn("Quantity Sold").letter}${worksheet.rowCount})` },
        "Total Sale": { formula: `SUM(${worksheet.getColumn("Total Sale").letter}2:${worksheet.getColumn("Total Sale").letter}${worksheet.rowCount})` },
    });

    totalRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "5B9BD5" } }; // Blue
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    addLegendSheet(workbook);

    const filePath = path.join(__dirname, "../ExportedData.xlsx");
    await workbook.xlsx.writeFile(filePath);

    exec(`start excel "${filePath}"`, (err) => {
        if (err) {
            console.error("Error opening Excel file:", err);
        } else {
            console.log("Excel file opened successfully");
        }
    });

    return filePath;
};

module.exports = { generateExcelFile, getFilteredData };
