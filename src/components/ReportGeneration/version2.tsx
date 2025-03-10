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

// Import KendoReact PDF Export components
import { PDFExport, savePDF } from '@progress/kendo-react-pdf';

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
  const reportRef = useRef<PDFExport>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [timeFrame, setTimeFrame] = useState<string>('daily');
  
  const handleTimeFrameChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value as string);
  };

  // Function to directly generate and download PDF
  const downloadPDF = () => {
    if (reportRef.current) {
      reportRef.current.save();
    } else if (contentRef.current) {
      // Fallback method if the PDFExport ref is not available
      savePDF(contentRef.current, {
        paperSize: 'A4',
        margin: '1cm',
        fileName: `EcoCare_SmartHome_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      });
    } else {
      alert('Could not generate the report. Please try again.');
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

  // PDF export options
  const pdfExportOptions = {
    paperSize: 'A4',
    margin: '1cm',
    fileName: `EcoCare_SmartHome_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    author: 'EcoCare Smart Home System',
    subject: 'Smart Home Energy Report',
    scale: 0.8,
  };

  // If used in button-only mode, render the button and hidden report
  if (!standalone) {
    return (
      <>
        {/* Hidden report content wrapped in PDFExport component */}
        <div style={{ display: 'none' }}>
          <PDFExport 
            ref={reportRef} 
            paperSize="A4"
            margin="1cm"
            fileName={`EcoCare_SmartHome_Report_${new Date().toISOString().split('T')[0]}.pdf`}
            author="EcoCare Smart Home System"
            scale={0.8}
          >
            <div ref={contentRef}>
              <h1>EcoCare Smart Home Daily Report</h1>
              <p>Generated on: {new Date().toLocaleDateString()}</p>
              
              <div className="divider" style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}></div>
              
              <h2>Energy Overview</h2>
              <div className="chart-placeholder" style={{ 
                height: '200px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}>
                <p>Energy consumption, generation, and storage chart</p>
              </div>
              
              <p>Total Consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh</p>
              <p>Total Generation: {energyData.reduce((acc, curr) => acc + curr.generation, 0).toFixed(1)} kWh</p>
              <p>Average Storage Level: {(energyData.reduce((acc, curr) => acc + curr.storage, 0) / energyData.length).toFixed(1)} kWh</p>
              
              <div className="divider" style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}></div>
              
              <div className="grid" style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <h2>Device Energy Usage</h2>
                  <div className="chart-placeholder" style={{ 
                    height: '200px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
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
                  <div className="chart-placeholder" style={{ 
                    height: '200px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
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
              
              <div className="divider" style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}></div>
              
              <div className="grid" style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div className="card" style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <h2>Energy Saving Goal Progress</h2>
                  <div className="progress-bar-container" style={{ 
                    height: '20px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${currentGoal.percentComplete}%`,
                        height: '100%',
                        backgroundColor: '#4caf50'
                      }}
                    ></div>
                  </div>
                  <p>Current Savings: {currentGoal.currentSavings} kWh ({currentGoal.percentComplete}%)</p>
                  <p>Target: {currentGoal.target} kWh</p>
                </div>
                
                <div className="card" style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
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
              
              <div className="divider" style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}></div>
              
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
                <p style={{ color: '#f44336' }}>
                  Note: {deviceFaultData.length} device {deviceFaultData.length === 1 ? 'fault was' : 'faults were'} detected today. Please check the Device Faults section for details.
                </p>
              )}
            </div>
          </PDFExport>
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
      <Paper sx={{ p: 4, mb: 4 }}>
        <PDFExport 
          ref={reportRef} 
          paperSize="A4"
          margin="1cm"
          fileName={`EcoCare_SmartHome_Report_${new Date().toISOString().split('T')[0]}.pdf`}
          author="EcoCare Smart Home System"
          scale={0.8}
        >
          <div ref={contentRef}>
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
          </div>
        </PDFExport>

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