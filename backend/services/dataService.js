const fs = require("fs");
const path = require("path");

const getFilteredData = (filters) => {
    // Citirea fișierului JSON
    const rawData = fs.readFileSync(path.join(__dirname, "../csvjson.json"));
    const salesData = JSON.parse(rawData);

    // Filtrarea datelor conform filtrelor
    return salesData.filter((sale) => {
        const matchesYear = filters.year ? sale.Year === parseInt(filters.year) : true;
        const matchesCategory = filters.productCategory ? sale["Product Type"] === filters.productCategory : true;
        const matchesGender = filters.gender ? sale["Customer Gender"] === filters.gender : true;
        const matchesRegion = filters.region ? sale.Region === filters.region : true;

        return matchesYear && matchesCategory && matchesGender && matchesRegion;
    });
};

module.exports = { getFilteredData };
