import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Grid,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import regression from "regression"; // Import corect pentru librăria de regresie
import axios from "axios"; // Import axios pentru cererile HTTP

const CombinedModal = ({ open, handleClose, salesData }) => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedGender, setSelectedGender] = useState(""); // Filtru gen
  const [selectedProductType, setSelectedProductType] = useState(""); // Filtru tip produs
  const [forecastYears, setForecastYears] = useState(3); // ani de previziune
  const [trendType, setTrendType] = useState("Linear"); // Tipul de trend selectat
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false); // Stare de încărcare

  // Obțineți valorile unice pentru fiecare câmp de filtrare
  const uniqueRegions = [...new Set(salesData.map((item) => item.Region))];
  const uniqueGenders = [...new Set(salesData.map((item) => item["Customer Gender"]))];
  const uniqueProductTypes = [...new Set(salesData.map((item) => item["Product Type"]))];

  const generateTrendAndForecast = () => {
    // Filtrăm datele pe regiune, gen și tip produs
    const filteredSales = salesData.filter(
      (item) =>
        (!selectedRegion || item.Region === selectedRegion) &&
        (!selectedGender || item["Customer Gender"] === selectedGender) &&
        (!selectedProductType || item["Product Type"] === selectedProductType)
    );

    // Extragem vânzările anuale
    const yearlySales = {};
    filteredSales.forEach((item) => {
      const year = new Date(item.Date).getFullYear();
      if (!yearlySales[year]) yearlySales[year] = 0;
      yearlySales[year] += item["Total Sale"];
    });

    // Obținem anii și vânzările existente
    const years = Object.keys(yearlySales).map((year) => parseInt(year, 10));
    const sales = Object.values(yearlySales);

    let forecastValues = [];
    const lastYear = Math.max(...years);
    const forecastYearsArray = Array.from(
      { length: forecastYears },
      (_, i) => lastYear + i + 1
    );

    // Generăm previziuni pe baza tipului de trend selectat
    if (trendType === "Linear") {
      // Calcul regresie liniară
      const n = years.length;
      const sumX = years.reduce((sum, x) => sum + x, 0);
      const sumY = sales.reduce((sum, y) => sum + y, 0);
      const sumXY = years.reduce((sum, x, i) => sum + x * sales[i], 0);
      const sumX2 = years.reduce((sum, x) => sum + x * x, 0);

      const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // Panta
      const b = (sumY - m * sumX) / n; // Intercept

      forecastValues = forecastYearsArray.map((year) => m * year + b);
    } else if (trendType === "Polynomial") {
      // Calcul regresie polinomială folosind o librărie de regresie
      const dataPoints = years.map((year, index) => [year, sales[index]]);
      const result = regression.polynomial(dataPoints, { order: 2 }); // Poți ajusta ordinea regresiei
      forecastValues = forecastYearsArray.map((year) =>
        result.equation[0] * Math.pow(year, 2) + result.equation[1] * year + result.equation[2]
      );
    } else if (trendType === "Exponential") {
      // Calcul regresie exponențială
      const dataPoints = years.map((year, index) => [year, Math.log(sales[index])]);
      const result = regression.linear(dataPoints); // Folosim regresia liniară pe date logaritmice
      const a = Math.exp(result.equation[1]);
      const b = result.equation[0];
      forecastValues = forecastYearsArray.map((year) => a * Math.exp(b * year));
    }

    // Creăm datele pentru grafic
    setChartData({
      labels: [...years, ...forecastYearsArray],
      datasets: [
        {
          label: "Vânzări Istorice",
          data: sales,
          borderColor: "#20B2AA", // Verde-mentă
          backgroundColor: "rgba(32, 178, 170, 0.2)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Prognoza",
          data: [...sales, ...forecastValues], // Conectăm datele istorice cu previziunea
          borderColor: "#FF69B4", // Roz intens
          borderDash: [5, 5], // Linie punctată pentru prognoză
          backgroundColor: "rgba(255, 105, 180, 0.2)",
          tension: 0.4,
          fill: false,
        },
      ],
    });
  };

  const handleExport = async () => {
    try {
        const filters = {
            gender: selectedGender,
            years: forecastYears,
            region: selectedRegion,
            productType: selectedProductType,
            trendType, // Include tipul de trend selectat
        };

        const response = await axios.post("http://localhost:5000/api/excel/export-page2", { filters });

        const { filePath } = response.data;
        window.open(filePath, "_blank");
    } catch (error) {
        console.error("Eroare la export:", error.response ? error.response.data : error.message);
        alert("Eroare la exportul fișierului Excel.");
    }
};

  return (
    <Modal open={open} onClose={handleClose}>
      <Box 
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          overflowY: "auto", // Scrollbar adăugat pentru conținutul mare
          maxHeight: "90vh", // Limitează înălțimea la 90% din înălțimea vizibilă
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Previzualizare și Previziuni
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Filtrele într-o grilă de 2 coloane */}
        <Grid container spacing={2}>
          {/* Filtru Regiune */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Regiune</InputLabel>
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <MenuItem value="">Toate</MenuItem>
                {uniqueRegions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtru Gen */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Gen</InputLabel>
              <Select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <MenuItem value="">Toate</MenuItem>
                {uniqueGenders.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtru Tip Produs */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Tip Produs</InputLabel>
              <Select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
              >
                <MenuItem value="">Toate</MenuItem>
                {uniqueProductTypes.map((productType) => (
                  <MenuItem key={productType} value={productType}>
                    {productType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtru Ani de Previziune */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Ani de Previziune</InputLabel>
              <Select
                value={forecastYears}
                onChange={(e) => setForecastYears(e.target.value)}
              >
                {[3, 5, 10].map((years) => (
                  <MenuItem key={years} value={years}>
                    {years}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtru Tip Trend */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Tip Trend</InputLabel>
              <Select
                value={trendType}
                onChange={(e) => setTrendType(e.target.value)}
              >
                <MenuItem value="Linear">Liniar</MenuItem>
                <MenuItem value="Polynomial">Polinomial</MenuItem>
                <MenuItem value="Exponential">Exponențial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Graficele */}
        <Box sx={{ mt: 4 }}>
          {chartData && (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          )}
        </Box>

        {/* Butoane */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" onClick={generateTrendAndForecast}>
            Generați Previziuni
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            disabled={loading} // Butonul este dezactivat dacă se află în proces de export
          >
            {loading ? "Se generează..." : "Exportă Fișier Excel"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CombinedModal;
