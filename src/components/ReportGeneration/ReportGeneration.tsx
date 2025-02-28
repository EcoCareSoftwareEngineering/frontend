import React, { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportGeneration: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { toPDF } = usePDF({ filename: 'smart-home-report.pdf' });

  // Mock data for heat and water usage
  const heatUsageData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Heat Usage (kWh)',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const waterUsageData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Water Usage (L)',
        data: [120, 190, 130, 170, 150, 140, 160],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div ref={targetRef} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Smart Home Usage Report</h1>
        <p>Generated on: {new Date().toLocaleDateString()}</p>

        <h2>Heat Usage</h2>
        <div style={{ width: '600px', marginBottom: '40px' }}>
          <Bar data={heatUsageData} />
        </div>

        <h2>Water Usage</h2>
        <div style={{ width: '600px', marginBottom: '40px' }}>
          <Bar data={waterUsageData} />
        </div>

        <h2>Summary</h2>
        <p>
          This report summarizes the heat and water usage for your smart home over the past 7 months.
          Use this data to optimize your energy and water consumption.
        </p>
      </div>

      <button
        onClick={() => toPDF()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default ReportGeneration;