const { generateExcelFile } = require("../services/excelService");

const generateExcel = async (req, res) => {
    try {
        const filters = req.body;
        console.log("Controller received filters:", filters); // Log pentru verificare

        const filePath = await generateExcelFile(filters); // Trimite filters direct

        res.status(200).json({ message: "Excel file generated successfully", path: filePath });
    } catch (error) {
        console.error("Error generating Excel file:", error);
        res.status(500).send("Failed to generate Excel file");
    }
};

module.exports = { generateExcel };
