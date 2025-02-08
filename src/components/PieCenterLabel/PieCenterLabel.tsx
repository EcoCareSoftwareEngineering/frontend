import { useDrawingArea } from '@mui/x-charts/hooks'
import './PieCenterLabel.scss'

const PieCenterLabel = ({ children }: { children: React.ReactNode }) => {
  const { width, height, left, top } = useDrawingArea()
  return (
    <text className='centerLabel' x={left + width / 2} y={top + height / 2}>
      {children}
    </text>
  )
}

export default PieCenterLabel
