// Exemplu de date pentru demonstrație
const salesData = [
    { region: 'Moldova', productType: 'Skincare', subCategory: 'Face Cream', salesAmount: 1500 },
    { region: 'Moldova', productType: 'Makeup', subCategory: 'Foundation', salesAmount: 2000 },
    { region: 'Banat', productType: 'Fragrance', subCategory: 'Perfume', salesAmount: 1200 },
    { region: 'Oltenia', productType: 'Skincare', subCategory: 'Body Lotion', salesAmount: 800 },
    // Adaugă mai multe date de vânzări pentru teste
  ];
  
  // Funcție care filtrează datele în funcție de filtrele aplicate (data, productType, gender)
  const getFilteredSalesData = (filters) => {
    return new Promise((resolve, reject) => {
      try {
        let filteredData = salesData;
  
        if (filters.date) {
          // Aplică filtrul pentru data (exemplu)
          filteredData = filteredData.filter(item => item.date === filters.date);
        }
        if (filters.productType) {
          // Aplică filtrul pentru categoria de produs
          filteredData = filteredData.filter(item => item.productType === filters.productType);
        }
        if (filters.gender) {
          // Aplică filtrul pentru gender
          filteredData = filteredData.filter(item => item.gender === filters.gender);
        }
  
        resolve(filteredData);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Funcție pentru generarea datelor pentru pie charts pe subcategoriile produselor
  const generatePieChartData = (regionSalesData) => {
    const pieChartData = {};
  
    regionSalesData.forEach(item => {
      if (!pieChartData[item.subCategory]) {
        pieChartData[item.subCategory] = 0;
      }
      pieChartData[item.subCategory] += item.salesAmount;
    });
  
    return pieChartData;
  };
  
  module.exports = { getFilteredSalesData, generatePieChartData };
  