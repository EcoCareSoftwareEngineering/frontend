import { useSpring, animated, easings } from '@react-spring/web'
import { getCSSVariable } from '../../utils'
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
  const RED = getCSSVariable('--red-color')
  const YELLOW = getCSSVariable('--yellow-color')
  const GREEN = getCSSVariable('--green-color')
  const DIAL = getCSSVariable('--clear-text')

  const textShift = value.length * -6 + 3

  const { sweepAngle } = useSpring({
    from: { sweepAngle: 180 },
    to: { sweepAngle: 360 },
    config: { duration: 300 },
  })

  const { animatedAngle } = useSpring({
    from: { animatedAngle: 0 },
    to: { animatedAngle: angle },
    config: {
      duration: 250,
      easing: easings.easeOutSine,
    },
  })

  return (
    <svg className='pie-chart' width='1000' height='1000' viewBox='0 0 300 170'>
      <defs>
        <animated.clipPath id='revealClip'>
          <animated.path
            d={sweepAngle.to(
              a => `
              M 0 0
              L 150 0
              A 150 150 0 ${a > 180 ? 1 : 0} 1 ${
                150 * Math.cos((a * Math.PI) / 180)
              } ${150 * Math.sin((a * Math.PI) / 180)}
              Z
            `
            )}
          />
        </animated.clipPath>
      </defs>

      <g transform={transform} clipPath='url(#revealClip)'>
        {/* Red Arc */}
        <path
          d='M-116.438,-3.812A116.5,116.5,0,0,1,-56.525,-101.868L-43.225,-75.934A87.375,87.375,0,0,0,-87.292,-3.812Z'
          visibility='none'
          cursor='unset'
          fill={RED}
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />

        {/* Yellow Arc */}
        <path
          d='M-49.741,-105.347A116.5,116.5,0,0,1,-0.763,-116.498L-1.526,-87.362A87.375,87.375,0,0,0,-36.441,-79.413Z'
          visibility='visible'
          cursor='unset'
          fill={YELLOW}
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />

        {/* Green Arc */}
        <path
          d='M6.859,-116.298A116.5,116.5,0,0,1,116.438,-3.812L87.292,-3.812A87.375,87.375,0,0,0,6.096,-87.162Z'
          visibility='visible'
          cursor='unset'
          fill={GREEN}
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />

        <text x={textShift} y='-6' className='pie-center-item'>
          {value}
        </text>
        <text x='-104' y='20' className='net-energy-label'>
          Net returned to the grid
        </text>

        {/* Animated Dial Arm */}
        <animated.line
          x1='0'
          y1='-50'
          x2='0'
          y2='-100'
          stroke={DIAL}
          strokeWidth='6'
          strokeLinecap='round'
          transform={animatedAngle.to(a => `rotate(${a})`)}
        />
      </g>
    </svg>
  )
}

export default NetEnergyDial
