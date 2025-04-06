import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";
import "./PriceElasticity.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend);

const PriceInput = ({ priceChangePercent, onPriceChange }) => (
    <div className="input-group">
        <label>Price Change Percentage:</label>
        <input
            type="number"
            value={priceChangePercent}
            onChange={(e) => onPriceChange(parseFloat(e.target.value))}
        />
    </div>
);

const SeasonSelector = ({ selectedSeason, onSeasonChange }) => (
    <div className="input-group">
        <label>Select Season:</label>
        <select value={selectedSeason} onChange={(e) => onSeasonChange(e.target.value)}>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Autumn">Autumn</option>
        </select>
    </div>
);

const PriceImpact = () => {
    const [loading, setLoading] = useState(true);
    const [priceChangePercent, setPriceChangePercent] = useState(0);
    const [elasticityResults, setElasticityResults] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("Winter");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/csvjson.json`);
            const salesData = await response.json();
            const groupedData = groupDataByProductAndSeason(salesData);
            const elasticity = calculateElasticity(groupedData);
            setElasticityResults(elasticity);
        } catch (error) {
            console.error("Error reading data from JSON:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const groupDataByProductAndSeason = (data) => {
        const grouped = {};

        data.forEach((sale) => {
            const { "Product Type": productType, "Season": season, "Unit Price": unitPrice, "Total Sale": totalSale } = sale;
            const key = `${productType}-${season}`;

            if (!grouped[key]) grouped[key] = { prices: [], sales: [] };

            grouped[key].prices.push(unitPrice);
            grouped[key].sales.push(totalSale);
        });

        return grouped;
    };

    const calculateElasticity = (groupedData) => {
        const results = [];

        Object.keys(groupedData).forEach((key) => {
            const { prices, sales } = groupedData[key];
            const [productType, season] = key.split("-");

            if (prices.length > 1) {
                let elasticitySum = 0;
                let count = 0;

                for (let i = 1; i < prices.length; i++) {
                    const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1];
                    const salesChange = (sales[i] - sales[i - 1]) / sales[i - 1];

                    if (priceChange !== 0) {
                        const elasticity = salesChange / priceChange;
                        elasticitySum += elasticity;
                        count++;
                    }
                }

                const averageElasticity = count > 0 ? elasticitySum / count : 0;
                results.push({
                    productType,
                    season,
                    elasticity: averageElasticity,
                    currentSales: sales[sales.length - 1],
                    prices,
                    sales
                });
            }
        });

        return results;
    };

    const updatedElasticityResults = useMemo(() => {
        return elasticityResults
            .filter(result => result.season === selectedSeason)
            .map(result => {
                const { elasticity, currentSales } = result;
                
                
                const predictedSales = currentSales * (1 - elasticity * priceChangePercent / 100);
                
                return { ...result, predictedSales };
            });
    }, [elasticityResults, priceChangePercent, selectedSeason]);

    const getDatasets = () => {
        const currentSalesDataset = {
            label: "Current Sales",
            data: updatedElasticityResults.map(result => result.currentSales),
            borderColor: "blue",
            fill: false,
            pointStyle: 'circle',
            pointRadius: 5,
        };

        const predictedSalesDataset = {
            label: priceChangePercent > 0 ? "Estimated Sales " : "Estimated Sales ",
            data: updatedElasticityResults.map(result => result.predictedSales),
            borderColor: priceChangePercent > 0 ? "green" : "red",
            fill: false,
            borderDash: [5, 5],
            pointStyle: 'rectRot',
            pointRadius: 5,
        };

        return [currentSalesDataset, predictedSalesDataset];
    };

    const mainChartData = {
        labels: updatedElasticityResults.map(result => result.productType),
        datasets: getDatasets(),
    };

    return (
        <div className="content-wrapper">
            <h2>Price Impact Demand Estimation</h2>

            <PriceInput 
                priceChangePercent={priceChangePercent}
                onPriceChange={setPriceChangePercent}
            />
            <SeasonSelector 
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
            />

            {!loading && updatedElasticityResults.length === 0 && (
                <p>No data available for season {selectedSeason}.</p>
            )}

            {!loading && updatedElasticityResults.length > 0 && (
                <>
                    <h3>Main Chart</h3>
                    <div className="chart-container">
                        <Line data={mainChartData} />
                    </div>

                    <h3>Predictions per Product in Season {selectedSeason}</h3>
                    <div className="small-charts-container">
                        {updatedElasticityResults.map((result, index) => {
                            const productChartData = {
                                labels: result.prices,
                                datasets: [
                                    {
                                        label: "Sales",
                                        data: result.sales,
                                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                                        borderColor: "rgba(54, 162, 235, 1)",
                                        borderWidth: 1,
                                    }
                                ]
                            };

                            return (
                                <div key={index} className="product-chart">
                                    <h4>{result.productType} ({result.season})</h4>
                                    <Bar data={productChartData} />
                                    <p>Elasticity: {result.elasticity.toFixed(2)}</p>
                                    <p>Current Sales: {result.currentSales.toFixed(2)}</p>
                                    <p>Estimated Sales: {result.predictedSales.toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceImpact;
