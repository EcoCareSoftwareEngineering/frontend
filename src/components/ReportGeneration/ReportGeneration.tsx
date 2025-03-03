import React, { useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import {
  BarChart,
  LineChart,
  PieChart
} from '@mui/x-charts';

// Define interface for device faults
interface DeviceFault {
  deviceName: string;
  timestamp: string;
  description: string;
}

// Interface for device usage
interface DeviceUsage {
  deviceName: string;
  usageHours: number;
  energyConsumed: number;
}

// Interface for energy data
interface EnergyData {
  time: string;
  consumption: number;
  generation: number;
  storage: number;
}

interface ReportGenerationProps {
  standalone?: boolean;
}

const ReportGeneration: React.FC<ReportGenerationProps> = ({ standalone = false }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [timeFrame, setTimeFrame] = useState<string>('daily');
  
  const handleTimeFrameChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value as string);
  };

  // Function to directly generate and download PDF using browser print
  const downloadPDF = () => {
    // Create a new window with only the report content
    const printWindow = window.open('', '_blank');
    
    if (printWindow && reportRef.current) {
      // Set up the document with appropriate styling
      printWindow.document.write(`
        <html>
          <head>
            <title>EcoCare Smart Home Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              h1, h2, h3, h4, h5 {
                color: #1976d2;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
              }
              .progress-bar-container {
                height: 20px;
                background-color: #f0f0f0;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
              }
              .progress-bar {
                height: 100%;
                background-color: #4caf50;
              }
              .divider {
                border-top: 1px solid #ddd;
                margin: 20px 0;
              }
              .error-text {
                color: #f44336;
              }
              .chart-placeholder {
                height: 200px;
                background-color: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              ${reportRef.current.innerHTML}
            </div>
            <script>
              // Print and close the window automatically
              window.onload = function() {
                window.print();
                window.setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } else {
      alert('Could not open print window. Please check your browser settings and try again.');
    }
  };

  // Mock data for energy consumption
  const energyData: EnergyData[] = [
    { time: '00:00', consumption: 2.5, generation: 0, storage: 10.2 },
    { time: '04:00', consumption: 1.8, generation: 0, storage: 9.8 },
    { time: '08:00', consumption: 4.2, generation: 1.2, storage: 9.2 },
    { time: '12:00', consumption: 5.7, generation: 3.5, storage: 10.1 },
    { time: '16:00', consumption: 6.3, generation: 2.8, storage: 9.5 },
    { time: '20:00', consumption: 4.9, generation: 0.3, storage: 8.9 },
  ];

  // Mock data for device usage
  const deviceUsageData: DeviceUsage[] = [
    { deviceName: 'Smart Thermostat', usageHours: 24, energyConsumed: 1.2 },
    { deviceName: 'Washing Machine', usageHours: 2.5, energyConsumed: 3.7 },
    { deviceName: 'Electric Oven', usageHours: 1.2, energyConsumed: 2.4 },
    { deviceName: 'Water Heater', usageHours: 5.5, energyConsumed: 8.2 },
    { deviceName: 'TV', usageHours: 4.8, energyConsumed: 1.1 },
  ];

  // Mock data for device faults
  const deviceFaultData: DeviceFault[] = [
    { deviceName: 'Smart Thermostat', timestamp: '2024-03-03 08:23', description: 'Connection timeout' },
    { deviceName: 'Water Heater', timestamp: '2024-03-03 14:45', description: 'Overheating detected' },
  ];

  // Energy saving goal progress
  const currentGoal = {
    target: 450,
    currentSavings: 320,
    percentComplete: 71,
  };

  // Chart data transformations
  const deviceUsageChartData = deviceUsageData.map(device => ({
    id: device.deviceName,
    value: device.energyConsumed,
    label: device.deviceName,
  }));

  // If used in button-only mode, render the button and hidden report
  if (!standalone) {
    return (
      <>
        {/* Hidden report content */}
        <div style={{ display: 'none' }}>
          <div ref={reportRef}>
            <h1>EcoCare Smart Home Daily Report</h1>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            
            <div className="divider"></div>
            
            <h2>Energy Overview</h2>
            <div className="chart-placeholder">
              <p>Energy consumption, generation, and storage chart</p>
            </div>
            
            <p>Total Consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh</p>
            <p>Total Generation: {energyData.reduce((acc, curr) => acc + curr.generation, 0).toFixed(1)} kWh</p>
            <p>Average Storage Level: {(energyData.reduce((acc, curr) => acc + curr.storage, 0) / energyData.length).toFixed(1)} kWh</p>
            
            <div className="divider"></div>
            
            <div className="grid">
              <div>
                <h2>Device Energy Usage</h2>
                <div className="chart-placeholder">
                  <p>Device energy usage pie chart</p>
                </div>
                <ul>
                  {deviceUsageData.map((device, index) => (
                    <li key={index}>
                      {device.deviceName}: {device.energyConsumed} kWh
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2>Device Usage Hours</h2>
                <div className="chart-placeholder">
                  <p>Device usage hours bar chart</p>
                </div>
                <ul>
                  {deviceUsageData.map((device, index) => (
                    <li key={index}>
                      {device.deviceName}: {device.usageHours} hours
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="grid">
              <div className="card">
                <h2>Energy Saving Goal Progress</h2>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${currentGoal.percentComplete}%` }}
                  ></div>
                </div>
                <p>Current Savings: {currentGoal.currentSavings} kWh ({currentGoal.percentComplete}%)</p>
                <p>Target: {currentGoal.target} kWh</p>
              </div>
              
              <div className="card">
                <h2>Device Faults</h2>
                {deviceFaultData.length > 0 ? (
                  <ul>
                    {deviceFaultData.map((fault, index) => (
                      <li key={index}>
                        <strong>{fault.deviceName}</strong> - {fault.timestamp}
                        <p>{fault.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No device faults detected today.</p>
                )}
              </div>
            </div>
            
            <div className="divider"></div>
            
            <h2>Summary</h2>
            <p>
              This report summarizes your smart home energy usage, device utilization, and progress toward your energy saving goals for {new Date().toLocaleDateString()}.
            </p>
            <p>
              Your home consumed a total of {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh today, with {deviceUsageData.length} active devices. The highest energy consumption was from your Water Heater (8.2 kWh).
            </p>
            <p>
              You are making good progress toward your energy saving goal, having achieved {currentGoal.percentComplete}% of your target. Keep up the good work!
            </p>
            {deviceFaultData.length > 0 && (
              <p className="error-text">
                Note: {deviceFaultData.length} device {deviceFaultData.length === 1 ? 'fault was' : 'faults were'} detected today. Please check the Device Faults section for details.
              </p>
            )}
          </div>
        </div>

        {/* Visible button to trigger download */}
        <Button
          onClick={downloadPDF}
          variant="contained"
          color="primary"
          startIcon={<i className="bi bi-file-earmark-pdf" />}
        >
          DOWNLOAD DEVICE REPORT
        </Button>
      </>
    );
  }

  // Full component rendering for standalone mode
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper ref={reportRef} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          EcoCare Smart Home Daily Report
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center">
          Generated on: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Energy Overview
            </Typography>
            <FormControl sx={{ minWidth: 200, mb: 2 }}>
              <InputLabel id="time-frame-label">Time Frame</InputLabel>
              <Select
                labelId="time-frame-label"
                value={timeFrame}
                label="Time Frame"
                onChange={handleTimeFrameChange}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ height: 350 }}>
              <LineChart
                xAxis={[{ 
                  data: energyData.map(d => d.time),
                  scaleType: 'band',
                  label: 'Time'
                }]}
                series={[
                  { 
                    data: energyData.map(d => d.consumption),
                    label: 'Energy Consumption (kWh)',
                    area: true,
                    stack: 'total',
                    color: '#f44336',
                  },
                  { 
                    data: energyData.map(d => d.generation),
                    label: 'Energy Generation (kWh)',
                    area: true,
                    stack: 'total',
                    color: '#4caf50',
                  },
                  { 
                    data: energyData.map(d => d.storage),
                    label: 'Energy Storage (kWh)',
                    color: '#2196f3',
                  }
                ]}
                height={300}
              />
            </Box>

            <Typography variant="body1" sx={{ mt: 2 }}>
              Total Consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh
            </Typography>
            <Typography variant="body1">
              Total Generation: {energyData.reduce((acc, curr) => acc + curr.generation, 0).toFixed(1)} kWh
            </Typography>
            <Typography variant="body1">
              Average Storage Level: {(energyData.reduce((acc, curr) => acc + curr.storage, 0) / energyData.length).toFixed(1)} kWh
            </Typography>
          </Grid>
        </Grid>

        {/* Rest of the component remains the same */}
        {/* ... */}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            onClick={downloadPDF}
            variant="contained"
            color="primary"
            size="large"
          >
            Download PDF Report
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportGeneration;