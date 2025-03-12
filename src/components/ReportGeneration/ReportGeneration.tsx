import React, { useRef } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { LineChart } from '@mui/x-charts'

const lineChartData = [
  { month: 'Jan', users: 1200, activeUsers: 800 },
  { month: 'Feb', users: 1900, activeUsers: 1200 },
  { month: 'Mar', users: 2200, activeUsers: 1400 },
  { month: 'Apr', users: 2800, activeUsers: 1600 },
  { month: 'May', users: 3500, activeUsers: 2100 },
  { month: 'Jun', users: 4200, activeUsers: 2700 },
]

const lineSeries = [
  { dataKey: 'users', label: 'Total Users', color: '#8884d8' },
  { dataKey: 'activeUsers', label: 'Active Users', color: '#82ca9d' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

// The component where the report content is stored
const ReportContent = React.forwardRef((props, ref) => {
  return (
    <Paper
      ref={ref}
      sx={{
        p: 4,
        top: '10000%',
        position: 'absolute',
        backgroundColor: 'white',
      }}
    >
      <Typography variant='h5' gutterBottom>
        Quarterly Performance Report
      </Typography>
      {/* Add your report content here */}
      <Box sx={{ height: 300, mb: 6, width: '100%' }}>
        <LineChart
          dataset={lineChartData}
          xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
          series={lineSeries}
          height={300}
          width={550}
          margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
        />
      </Box>
    </Paper>
  )
})

// Main component for the download button
const DownloadReportButton = () => {
  const reportRef = useRef(null)

  const generatePDF = async () => {
    if (!reportRef.current) return

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save('performance_report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div>
      <ReportContent ref={reportRef} />
      <Button variant='contained' color='primary' onClick={generatePDF}>
        <i className='bi bi-clipboard-data' />
        Generate Report
      </Button>
    </div>
  )
}

export default DownloadReportButton
