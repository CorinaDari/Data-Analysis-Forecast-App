const express = require('express');
const { generatePieChartData, getFilteredSalesData } = require('../services/salesService');
const router = express.Router();

// Regiunile din România
const REGIONS = [
  'Moldova', 'Banat', 'Dobrogea', 'Oltenia', 'Ardeal', 'Muntenia', 'Bucovina', 'Transilvania', 'Maramureș'
];

// Funcție pentru a filtra și obține datele pe regiuni
const getSalesByRegion = async (filters) => {
  try {
    // Aplică filtrele (exemplu: data, productType, gender)
    const filteredData = await getFilteredSalesData(filters);  // Obținem datele filtrate

    // Grupează vânzările pe regiuni
    const regionSalesData = REGIONS.reduce((acc, region) => {
      acc[region] = filteredData.filter(item => item.region === region); // Filtrăm datele pe regiune
      return acc;
    }, {});

    // Crează Pie Charts pentru fiecare regiune (pentru subcategoriile produselor)
    const pieChartData = {};
    for (const region in regionSalesData) {
      pieChartData[region] = generatePieChartData(regionSalesData[region]);
    }

    return pieChartData;
  } catch (error) {
    console.error('Eroare la obținerea datelor pe regiuni:', error);
    throw new Error('Nu am reușit să obținem datele pentru heatmap.');
  }
};

// Endpoint pentru generarea heatmap-ului cu pie charts
router.post('/generateHeatMap', async (req, res) => {
  try {
    const filters = req.body; // Filtrele aplicate (data, productType, gender)
    
    // Obținem datele pe regiuni cu pie charts
    const pieChartData = await getSalesByRegion(filters);

    // Returnăm datele pentru heatmap (sau le poți folosi pentru a vizualiza harta într-o aplicație frontend)
    res.status(200).json({
      message: 'Heatmap generated successfully!',
      data: pieChartData
    });
  } catch (error) {
    console.error('Eroare la generarea heatmap-ului:', error);
    res.status(500).send('Nu am reușit să generăm heatmap-ul.');
  }
});

module.exports = router;
