const path = require("path");
const fs = require("fs");
const { execFile, exec } = require("child_process"); // Import exec pentru a deschide Excel-ul

const generateExcelFilePage2 = async ({ gender, productType, region, years, trendType }) => {
    try {
        const filePath = path.join(__dirname, "../csvjson.json");
        const rawData = fs.readFileSync(filePath, "utf-8");
        const jsonData = JSON.parse(rawData);

        // Filtrarea datelor
        const filteredData = jsonData.filter((item) => {
            return (
                (!gender || item["Customer Gender"] === gender) &&
                (!productType || item["Product Type"] === productType) &&
                (!region || item["Region"] === region)
            );
        });

        if (filteredData.length === 0) {
            throw new Error("Nu există date care să corespundă filtrării.");
        }

        // Calcularea vânzărilor totale anuale
        const yearlySales = {};
        filteredData.forEach((data) => {
            const year = parseInt(data["Year"], 10);
            if (!yearlySales[year]) yearlySales[year] = 0;
            yearlySales[year] += data["Total Sale"];
        });

        const historicalData = Object.keys(yearlySales).map((year) => ({
            year: parseInt(year, 10),
            totalSales: yearlySales[year],
        }));

        // Generarea datelor de previziune
        const currentYear = new Date().getFullYear();
        const forecastData = Array.from({ length: years }, (_, i) => ({
            year: currentYear + i,
            totalSales: null, // Python va calcula previziunile
        }));

        const scriptPath = path.join(__dirname, "../scripts/generate_excel.py");
        const outputFile = path.join(__dirname, "../public/files/ExportedData.xlsx");

        // Rulează scriptul Python cu tipul de trend
        const pythonArgs = [
            JSON.stringify(historicalData),
            JSON.stringify(forecastData),
            trendType.toLowerCase(),
            outputFile, // Tipul de trend selectat
        ];

        await new Promise((resolve, reject) => {
            execFile("python", [scriptPath, ...pythonArgs], (error, stdout, stderr) => {
                if (error) {
                    console.error("Eroare la executarea scriptului Python:", stderr);
                    reject(error);
                } else {
                    console.log("Rezultatul scriptului Python:", stdout);
                    resolve();
                }
            });
        });

        return path.basename(outputFile);
    } catch (error) {
        console.error("Eroare la generarea fișierului Excel:", error);
        throw new Error("Eroare la crearea fișierului Excel.");
    }

};


module.exports = { generateExcelFilePage2 };
