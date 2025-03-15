import './NetEnergyDial.scss'

const NetEnergyDial = ({
  angle,
  value,
  transform,
}: {
  angle: number
  value: string
  transform: string
}) => {
  const shift = value.length * -6 + 3

  return (
    <svg className='pie-chart' width='1000' height='1000' viewBox='0 0 300 170'>
      <g transform={transform}>
        <path
          d='M-116.438,-3.812A116.5,116.5,0,0,1,-56.525,-101.868L-43.225,-75.934A87.375,87.375,0,0,0,-87.292,-3.812Z'
          visibility='visible'
          cursor='unset'
          fill='#ec443b'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <path
          d='M-49.741,-105.347A116.5,116.5,0,0,1,-0.763,-116.498L-1.526,-87.362A87.375,87.375,0,0,0,-36.441,-79.413Z'
          visibility='visible'
          cursor='unset'
          fill='#fbad53'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <path
          d='M6.859,-116.298A116.5,116.5,0,0,1,116.438,-3.812L87.292,-3.812A87.375,87.375,0,0,0,6.096,-87.162Z'
          visibility='visible'
          cursor='unset'
          fill='#07cb83'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <text x={shift} y='-6' className='pie-center-item'>
          {value}
        </text>
        <text x='-104' y='20' className='net-energy-label'>
          Net returned to the grid
        </text>
        <line
          x1='0'
          y1='-50'
          x2='0'
          y2='-100'
          stroke='white'
          strokeWidth='6'
          strokeLinecap='round'
          transform={`rotate(${angle})`}
        />
      </g>
    </svg>
  )
}

export default NetEnergyDial
