import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieChart = ({ data, onHoverChange, description }) => {
  const [hovered, setHovered] = useState(false);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Total Sale',
        data: Object.values(data),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#FF9F40',
          '#FF57A5',
          '#9B59B6',
          '#F39C12',
          '#1F77B4',
          '#8E44AD',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#FF9F40',
          '#FF57A5',
          '#9B59B6',
          '#F39C12',
          '#1F77B4',
          '#8E44AD',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw} lei`;
          },
        },
      },
      legend: {
        display: true, 
        position: 'bottom',
        labels: {
          font: {
            size: 10, 
          },
        },
      },
    },
    hover: {
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          setHovered(true);
          onHoverChange(true);
        } else {
          setHovered(false);
          onHoverChange(false);
        }
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '220px',
        maxHeight: '300px', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        margin: 'auto',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
        {description}
      </p>
      <div style={{ height: '200px' }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
