const path = require("path");
const { generateExcelFilePage2 } = require("../services/excelServicePage2");

const exportExcelPage2 = async (req, res) => {
    try {
        const { filters } = req.body;

        if (!filters || !filters.gender || !filters.years || !filters.trendType) {
            return res.status(400).json({ message: "Date incomplete pentru export." });
        }

        const { gender, years, region, productType, trendType } = filters;
        const fileName = await generateExcelFilePage2({ gender, years, region, productType, trendType });

        const fileUrl = `${req.protocol}://${req.get("host")}/files/${fileName}`;
        res.status(200).json({ message: "Fișier generat cu succes.", filePath: fileUrl });
    } catch (error) {
        console.error("Eroare în timpul exportului:", error.message);
        res.status(500).json({ message: "Eroare la generarea fișierului Excel." });
    }
};


module.exports = { exportExcelPage2 };
