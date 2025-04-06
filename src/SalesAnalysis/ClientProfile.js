import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { Form, Spinner, Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ageRanges = ["13-22", "23-32", "33-42", "43-52", "53-62", "63-73"];
const productTypes = [
    { type: "Sun Protection", color: "rgba(255, 99, 132, 0.6)" },
    { type: "Skincare", color: "rgba(54, 162, 235, 0.6)" },
    { type: "Makeup", color: "rgba(255, 206, 86, 0.6)" },
    { type: "Hair Care", color: "rgba(75, 192, 192, 0.6)" },
    { type: "Fragrance", color: "rgba(153, 102, 255, 0.6)" },
    { type: "Nails", color: "rgba(255, 159, 64, 0.6)" },
    { type: "Hands", color: "rgba(255, 99, 132, 0.3)" },
    { type: "Eyes", color: "rgba(54, 162, 235, 0.3)" },
    { type: "Lips", color: "rgba(255, 206, 86, 0.3)" },
];

const ageRangeToIndex = (ageRange) => ageRanges.indexOf(ageRange);

const CustomerPreferencesScatterPlot = () => {
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [gender, setGender] = useState("");
    const [preferences, setPreferences] = useState("");
    const [salesChannel, setSalesChannel] = useState("");
    const [promotion, setPromotion] = useState("");
    const [scatterData, setScatterData] = useState({ datasets: [] });

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/csvjson.json");
            const data = await response.json();
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    const filterData = () => {
        return salesData.filter((sale) => {
            const matchesGender = gender ? sale["Customer Gender"] === gender : true;
            const matchesPreferences = preferences ? sale["Product Type"] === preferences : true;
            const matchesSalesChannel = salesChannel ? sale["Sales Channel"] === salesChannel : true;
            const matchesPromotion = promotion ? sale["Promotion"] === promotion : true;
            return matchesGender && matchesPreferences && matchesSalesChannel && matchesPromotion;
        });
    };

    const generateScatterData = () => {
        const filteredData = filterData();

        const datasets = productTypes.map(({ type, color }) => ({
            label: type,
            data: filteredData
                .filter((sale) => sale["Product Type"] === type)
                .map((sale) => {
                    const ageRange = sale["Age Range"];
                    const ageIndex = ageRangeToIndex(ageRange);
                    const totalSale = sale["Total Sale"];
                    return {
                        x: ageRanges[ageIndex],
                        y: totalSale,
                        region: sale["Region"],
                        quantitySold: sale["Quantity Sold"],
                        salesChange: sale["Sales Change (%)"],
                        subtype: sale["Product Subtype"], 
                    };
                }),
            backgroundColor: color,
        }));

        return { datasets };
    };

    const calculateSummary = () => {
        const filteredData = filterData();
        const totalSales = filteredData.reduce((acc, sale) => acc + sale["Total Sale"], 0);
        const averageSales = filteredData.length ? totalSales / filteredData.length : 0;
        const quantitySold = filteredData.reduce((acc, sale) => acc + sale["Quantity Sold"], 0);

        return { totalSales, averageSales, quantitySold };
    };

    useEffect(() => {
        const data = generateScatterData();
        setScatterData(data);
    }, [salesData, gender, preferences, salesChannel, promotion]);

    if (loading) return <Spinner animation="border" />;

    const summary = calculateSummary();

    return (
        <Container style={{ maxWidth: "800px", marginTop: "20px" }}>
            <h2>Customer Preferences</h2>

            {/* Summary */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Total Sales</Card.Title>
                            <Card.Text>${summary.totalSales.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Average Sale</Card.Title>
                            <Card.Text>${summary.averageSales.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Total Quantity Sold</Card.Title>
                            <Card.Text>{summary.quantitySold}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Form>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="gender">
                            <Form.Label>Gender</Form.Label>
                            <Form.Control as="select" onChange={(e) => setGender(e.target.value)} value={gender}>
                                <option value="">All</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="preferences">
                            <Form.Label>Preferred Category</Form.Label>
                            <Form.Control as="select" onChange={(e) => setPreferences(e.target.value)} value={preferences}>
                                <option value="">All</option>
                                {productTypes.map(({ type }) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="salesChannel">
                            <Form.Label>Sales Channel</Form.Label>
                            <Form.Control as="select" onChange={(e) => setSalesChannel(e.target.value)} value={salesChannel}>
                                <option value="">All</option>
                                <option value="Distributors">Distributors</option>
                                <option value="Online">Online</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="promotion">
                            <Form.Label>Promotion</Form.Label>
                            <Form.Control as="select" onChange={(e) => setPromotion(e.target.value)} value={promotion}>
                                <option value="">All</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            {/* Scatter Plot */}
            <div style={{ width: "100%", marginTop: "20px" }}>
                <Scatter
                    data={scatterData}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                type: "category",
                                labels: ageRanges,
                                title: { display: true, text: "Age Range (Years)" },
                                offset: true,
                            },
                            y: {
                                title: { display: true, text: "Total Sale ($)" },
                                min: 1000,
                                max: 9000,
                                ticks: {
                                    stepSize: 1000,
                                },
                            },
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const { region, quantitySold, subtype } = context.raw;
                                        return [
                                            `Total Sale: $${context.raw.y}`,
                                            `Region: ${region}`,
                                            `Subtype: ${subtype}`, 
                                            `Quantity Sold: ${quantitySold}`,
                                            
                                        ];
                                    },
                                },
                            },
                        },
                    }}
                />
            </div>
        </Container>
    );
};

export default CustomerPreferencesScatterPlot;
