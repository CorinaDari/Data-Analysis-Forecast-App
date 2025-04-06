const ExcelJS = require("exceljs");

async function generateFilteredDataExcel(filteredData, filters) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");


    // Definirea coloanelor cu anteturi (excluzând cele menționate în introducere)
    worksheet.columns = [
        { header: "Date", key: "Date", width: 20 },
        { header: "Product Subtype", key: "Product Subtype", width: 20 },
        { header: "Customer Category", key: "Customer Category", width: 20 },
        { header: "Customer Gender", key: "Customer Gender", width: 20 },
        { header: "Age Range", key: "Age Range", width: 20 },
        { header: "Country", key: "Country", width: 20 },
        { header: "Sales Amount", key: "Sales Amount", width: 20 },
        { header: "Quantity Sold", key: "Quantity Sold", width: 20 },
        { header: "Unit Price", key: "Unit Price", width: 20 },
        { header: "Total Sale", key: "Total Sale", width: 20 },
        { header: "Sales Change (%)", key: "Sales Change (%)", width: 20 },
    ];

    // Stilizare antet tabel
    worksheet.getRow(4).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Adaugă datele filtrate
    worksheet.addRows(filteredData);

    // Stilizare date tabel (similar codului anterior)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 4) return; // Ignoră introducerea și antetul

        const salesAmountIndex = worksheet.getColumnKey('Sales Amount')?.number || 7;
        const totalSaleIndex = worksheet.getColumnKey('Total Sale')?.number || 10;
        const salesChangeIndex = worksheet.getColumnKey('Sales Change (%)')?.number || 11;

        const salesAmountCell = row.getCell(salesAmountIndex);
        const totalSaleCell = row.getCell(totalSaleIndex);
        const salesChangeCell = row.getCell(salesChangeIndex);

        const salesAmount = parseFloat(salesAmountCell.value) || 0;
        const totalSale = parseFloat(totalSaleCell.value) || 0;
        const salesChange = parseFloat(salesChangeCell.value) || 0;

        // Formatare "Sales Amount"
        if (salesAmount > 1000) {
            salesAmountCell.style = {
                font: { color: { argb: "FF0000" }, bold: true },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } },
                alignment: { horizontal: "center" },
            };
        } else {
            salesAmountCell.style = {
                font: { color: { argb: "008000" } },
                alignment: { horizontal: "center" },
            };
        }

        // Formatare "Total Sale"
        if (totalSale >= 0) {
            totalSaleCell.style = {
                font: { color: { argb: "FF00FF" }, bold: true },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "E7E6E6" } },
            };
        } else {
            totalSaleCell.style = {
                font: { color: { argb: "FF0000" }, bold: true },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "F4CCCC" } },
            };
        }

        // Formatare "Sales Change (%)"
        salesChangeCell.style = {
            font: { color: salesChange >= 0 ? { argb: "0066CC" } : { argb: "FF0000" } },
        };
    });

    return workbook;
}


module.exports = generateFilteredDataExcel;
