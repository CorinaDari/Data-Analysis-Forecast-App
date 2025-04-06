import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PieChart from './PieChart';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomOverlay = ({ position, children, onHover }) => {
  const map = useMap();
  const divRef = useRef(document.createElement('div'));

  useEffect(() => {
    const overlay = L.popup({ closeButton: false, autoClose: false })
      .setLatLng(position)
      .setContent(divRef.current)
      .openOn(map);

    return () => {
      map.removeLayer(overlay);
    };
  }, [map, position]);

  useEffect(() => {
    if (onHover) {
      map.dragging.disable();
    } else {
      map.dragging.enable();
    }
  }, [map, onHover]);

  return createPortal(
    <div
      style={{
        transform: `scale(1)`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease',
        width: '200px',
        maxWidth: '100%',
        textAlign: 'center',
      }}
    >
      {children}
    </div>,
    divRef.current
  );
};

const Cartograma = () => {
  const [filters, setFilters] = useState({
    date: null,
    category: null,
    gender: null,
    chartType: 'pie',
  });
  const [salesData, setSalesData] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('/csvjson.json').then((res) => res.json());
        setJsonData(data);

        console.log('Loaded JSON data:', data); // Log pentru verificarea datelor încărcate

        // Extrage toate categoriile unice
        const uniqueCategories = [...new Set(data.map((entry) => entry['Product Type']))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading JSON data:', error);
      }
    };
    fetchData();
  }, []);

  const filterData = (filters, data) => {
    console.log('Filters applied:', filters); // Log pentru filtrele aplicate
    console.log('Data before filtering:', data); // Log pentru datele înainte de filtrare

    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.Date);
      const entryMonth = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      return (
        (!filters.date || entryMonth === filters.date) &&
        (!filters.category || entry['Product Type'] === filters.category) &&
        (!filters.gender || entry['Customer Gender'] === filters.gender)
      );
    });

    console.log('Data after filtering:', filtered); // Log pentru datele după filtrare
    return filtered;
  };

  const calculateRegionData = (filteredData, region) => {
    return filteredData
      .filter((entry) => entry.Region === region && entry['Total Sale'] && entry['Product Subtype'])
      .reduce((acc, entry) => {
        const subtype = entry['Product Subtype'];
        acc[subtype] = (acc[subtype] || 0) + parseFloat(entry['Total Sale']);
        acc[subtype] = parseFloat(acc[subtype]).toFixed(2);
        return acc;
      }, {});
  };

  useEffect(() => {
    setLoading(true);
    const regions = [
      { id: 'Moldova', name: 'Moldova', coords: [45.5, 27.5] },
      { id: 'Banat', name: 'Banat', coords: [45.7495, 21.2087] },
      { id: 'Muntenia', name: 'Muntenia', coords: [44.4268, 26.1025] },
      { id: 'Dobrogea', name: 'Dobrogea', coords: [44.035, 28.66] },
      { id: 'Ardeal', name: 'Ardeal', coords: [46.7704, 23.5897] },
      { id: 'Transylvania', name: 'Transylvania', coords: [46.0748, 23.6512] },
      { id: 'Oltenia', name: 'Oltenia', coords: [44.314, 23.8] },
      { id: 'Bucovina', name: 'Bucovina', coords: [47.633, 25.5] },
      { id: 'Maramures', name: 'Maramures', coords: [47.6582, 23.5795] },
    ];

    const filteredData = filterData(filters, jsonData);
    const updatedData = regions.map((region) => ({
      ...region,
      pieData: calculateRegionData(filteredData, region.name),
    }));

    console.log('Sales Data by Region:', updatedData); // Log pentru datele pe regiuni

    setSalesData(updatedData);
    setLoading(false);
  }, [filters, jsonData]);

  const handleFilterChange = (newFilter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilter,
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      setFilters({ ...filters, date: `${year}-${month < 10 ? '0' : ''}${month}` });
    } else {
      setFilters({ ...filters, date: null });
    }
  };

  const renderChart = (data, regionName) => {
    if (!data || Object.keys(data).length === 0) {
      return <p>Data not available.</p>;
    }
    const description = `Total sales for ${regionName}`;
    switch (filters.chartType) {
      case 'doughnut':
        return <DoughnutChart data={data} description={description} />;
      case 'bar':
        return <BarChart data={data} description={description} />;
      default:
        return <PieChart data={data} description={description} />;
    }
  };

  return (
    <div>
      <h2>Cartodiagram sales for Romania</h2>
      <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1000 }}>
        <label>
          Select Month and Year:
          <DatePicker
            selected={filters.date ? new Date(filters.date) : null}
            onChange={handleDateChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            customInput={<input type="text" style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }} />}
          />
        </label>
        <label>
          Select Category:
          <select
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Select Gender:
          <select
            onChange={(e) => handleFilterChange({ gender: e.target.value })}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label>
          Select Chart Type:
          <select
            onChange={(e) => handleFilterChange({ chartType: e.target.value })}
            style={{ marginLeft: '10px' }}
          >
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </label>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <MapContainer center={[45.9432, 24.9668]} zoom={6} style={{ height: '80vh', width: '100%', position: 'relative' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {salesData.map((sale) => (
            <React.Fragment key={sale.id}>
              <Marker position={sale.coords}>
                <CustomOverlay position={sale.coords}>
                  {renderChart(sale.pieData, sale.name)}
                </CustomOverlay>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default Cartograma;
