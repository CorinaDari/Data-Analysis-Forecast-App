import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const DoughnutChart = ({ data, description }) => {
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
          '#8A2BE2',
          '#FFA500',
          '#32CD32',
          '#8B4513',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#FF9F40',
          '#8A2BE2',
          '#FFA500',
          '#32CD32',
          '#8B4513',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
  };

  return (
    <div
      style={{
        width: '200px',
        maxHeight: '300px',
        overflowY: 'auto', 
        margin: 'auto',
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{description}</p>
      <div style={{ height: '200px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
