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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import Pdf from 'react-to-pdf'; // Import react-to-pdf

// Define interfaces
interface DeviceFault {
  deviceName: string;
  timestamp: string;
  description: string;
}

interface DeviceUsage {
  deviceName: string;
  usageHours: number;
  energyConsumed: number;
}

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

  // PDF generation options
  const pdfOptions = {
    filename: `EcoCare_Smart_Home_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    page: {
      margin: 20,
      format: 'letter',
      orientation: 'portrait' as const,
    },
    overrides: {
      canvas: {
        scale: 2,
        useCORS: true,
      },
    },
  };

  // Mock data
  const energyData: EnergyData[] = [
    { time: '00:00', consumption: 2.5, generation: 0, storage: 10.2 },
    { time: '04:00', consumption: 1.8, generation: 0, storage: 9.8 },
    { time: '08:00', consumption: 4.2, generation: 1.2, storage: 9.2 },
    { time: '12:00', consumption: 5.7, generation: 3.5, storage: 10.1 },
    { time: '16:00', consumption: 6.3, generation: 2.8, storage: 9.5 },
    { time: '20:00', consumption: 4.9, generation: 0.3, storage: 8.9 },
  ];

  const deviceUsageData: DeviceUsage[] = [
    { deviceName: 'Smart Thermostat', usageHours: 24, energyConsumed: 1.2 },
    { deviceName: 'Washing Machine', usageHours: 2.5, energyConsumed: 3.7 },
    { deviceName: 'Electric Oven', usageHours: 1.2, energyConsumed: 2.4 },
    { deviceName: 'Water Heater', usageHours: 5.5, energyConsumed: 8.2 },
    { deviceName: 'TV', usageHours: 4.8, energyConsumed: 1.1 },
  ];

  const deviceFaultData: DeviceFault[] = [
    { deviceName: 'Smart Thermostat', timestamp: '2024-03-03 08:23', description: 'Connection timeout' },
    { deviceName: 'Water Heater', timestamp: '2024-03-03 14:45', description: 'Overheating detected' },
  ];

  const currentGoal = {
    target: 450,
    currentSavings: 320,
    percentComplete: 71,
  };

  const deviceUsageChartData = deviceUsageData.map(device => ({
    id: device.deviceName,
    value: device.energyConsumed,
    label: device.deviceName,
  }));

  // Common styles for PDF and screen
  const reportStyles = {
    '& h1, & h2, & h3, & h4, & h5': { color: '#1976d2' },
    '& .divider': { borderTop: '1px solid #ddd', my: 2 },
    '& .card': { border: '1px solid #ddd', borderRadius: '8px', p: 2, mb: 2 },
    '& .progress-bar-container': {
      height: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      overflow: 'hidden',
      mb: 1,
    },
    '& .progress-bar': {
      height: '100%',
      backgroundColor: '#4caf50',
    },
    '& .error-text': { color: '#f44336' },
  };

  // Report content component
  const ReportContent = () => (
    <Box sx={reportStyles}>
      <Typography variant="h4" gutterBottom align="center">
        EcoCare Smart Home {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Report
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Generated on: {new Date().toLocaleDateString()}
      </Typography>
      <Divider className="divider" />
      <Typography variant="h5">Energy Overview</Typography>
      <Typography variant="body1">
        Total Consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh
      </Typography>
      <Typography variant="body1">
        Total Generation: {energyData.reduce((acc, curr) => acc + curr.generation, 0).toFixed(1)} kWh
      </Typography>
      <Typography variant="body1">
        Average Storage: {(energyData.reduce((acc, curr) => acc + curr.storage, 0) / energyData.length).toFixed(1)} kWh
      </Typography>
      <Divider className="divider" />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h5">Device Energy Usage</Typography>
          {deviceUsageData.map((device, index) => (
            <Typography key={index}>
              {device.deviceName}: {device.energyConsumed} kWh
            </Typography>
          ))}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h5">Device Usage Hours</Typography>
          {deviceUsageData.map((device, index) => (
            <Typography key={index}>
              {device.deviceName}: {device.usageHours} hours
            </Typography>
          ))}
        </Grid>
      </Grid>
      <Divider className="divider" />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className="card">
            <Typography variant="h5">Energy Saving Goal</Typography>
            <Box className="progress-bar-container">
              <Box className="progress-bar" sx={{ width: `${currentGoal.percentComplete}%` }} />
            </Box>
            <Typography>
              Current: {currentGoal.currentSavings} kWh ({currentGoal.percentComplete}%)
            </Typography>
            <Typography>Target: {currentGoal.target} kWh</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="card">
            <Typography variant="h5">Device Faults</Typography>
            {deviceFaultData.length > 0 ? (
              deviceFaultData.map((fault, index) => (
                <Box key={index}>
                  <Typography>
                    <strong>{fault.deviceName}</strong> - {fault.timestamp}
                  </Typography>
                  <Typography>{fault.description}</Typography>
                </Box>
              ))
            ) : (
              <Typography>No faults detected.</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
      <Divider className="divider" />
      <Typography variant="h5">Summary</Typography>
      <Typography>
        This report summarizes your smart home energy usage for {new Date().toLocaleDateString()}.
        Total consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh.
        Progress toward goal: {currentGoal.percentComplete}%.
        {deviceFaultData.length > 0 && (
          <Typography className="error-text">
            Note: {deviceFaultData.length} fault(s) detected.
          </Typography>
        )}
      </Typography>
    </Box>
  );

  // Render button-only mode with react-to-pdf
  if (!standalone) {
    return (
      <>
        <Box sx={{ display: 'none' }}>
          <div ref={reportRef}>
            <ReportContent />
          </div>
        </Box>
        <Pdf targetRef={reportRef} options={pdfOptions}>
          {({ toPdf }: { toPdf: () => void }) => (
            <Button
              onClick={toPdf}
              variant="contained"
              color="primary"
              startIcon={<i className="bi bi-file-earmark-pdf" />}
            >
              Download Device Report
            </Button>
          )}
        </Pdf>
      </>
    );
  }

  // Render full standalone mode
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <div ref={reportRef}>
          <Typography variant="h4" gutterBottom align="center">
            EcoCare Smart Home {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Report
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center">
            Generated on: {new Date().toLocaleDateString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Energy Overview
              </Typography>
              <FormControl sx={{ minWidth: 200, mb: 2 }}>
                <InputLabel>Time Frame</InputLabel>
                <Select value={timeFrame} label="Time Frame" onChange={handleTimeFrameChange}>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ height: 350 }}>
                <LineChart
                  xAxis={[{ data: energyData.map(d => d.time), scaleType: 'band', label: 'Time' }]}
                  series={[
                    { data: energyData.map(d => d.consumption), label: 'Consumption (kWh)', area: true, color: '#f44336' },
                    { data: energyData.map(d => d.generation), label: 'Generation (kWh)', area: true, color: '#4caf50' },
                    { data: energyData.map(d => d.storage), label: 'Storage (kWh)', color: '#2196f3' },
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
                Average Storage: {(energyData.reduce((acc, curr) => acc + curr.storage, 0) / energyData.length).toFixed(1)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5">Device Energy Usage</Typography>
              <PieChart series={[{ data: deviceUsageChartData }]} height={200} />
              <List>
                {deviceUsageData.map((device, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${device.deviceName}: ${device.energyConsumed} kWh`} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5">Device Usage Hours</Typography>
              <BarChart
                xAxis={[{ scaleType: 'band', data: deviceUsageData.map(d => d.deviceName) }]}
                series={[{ data: deviceUsageData.map(d => d.usageHours), label: 'Hours' }]}
                height={200}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="h5">Energy Saving Goal</Typography>
                <Box sx={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden', mb: 1 }}>
                  <Box sx={{ height: '100%', width: `${currentGoal.percentComplete}%`, backgroundColor: '#4caf50' }} />
                </Box>
                <Typography>
                  Current: {currentGoal.currentSavings} kWh ({currentGoal.percentComplete}%)
                </Typography>
                <Typography>Target: {currentGoal.target} kWh</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="h5">Device Faults</Typography>
                {deviceFaultData.length > 0 ? (
                  <List>
                    {deviceFaultData.map((fault, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${fault.deviceName} - ${fault.timestamp}`}
                          secondary={fault.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No faults detected.</Typography>
                )}
              </Card>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5">Summary</Typography>
          <Typography>
            This report summarizes your smart home energy usage for {new Date().toLocaleDateString()}.
            Total consumption: {energyData.reduce((acc, curr) => acc + curr.consumption, 0).toFixed(1)} kWh.
            Progress toward goal: {currentGoal.percentComplete}%.
            {deviceFaultData.length > 0 && (
              <Typography sx={{ color: '#f44336' }}>
                Note: {deviceFaultData.length} fault(s) detected.
              </Typography>
            )}
          </Typography>
        </div>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pdf targetRef={reportRef} options={pdfOptions}>
            {({ toPdf }: { toPdf: () => void }) => (
              <Button onClick={toPdf} variant="contained" color="primary" size="large">
                Download PDF Report
              </Button>
            )}
          </Pdf>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportGeneration;