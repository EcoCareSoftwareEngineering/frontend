import { TTimeSelection } from '../../types/generalTypes'
import { useEffect, useState } from 'react'
import './Dropdown.scss'

const Dropdown = ({
  onSelect,
}: {
  onSelect: (value: TTimeSelection) => void
}) => {
  const options: TTimeSelection[] = [
    'Today',
    'Past week',
    'Past month',
    'Past year',
  ]

  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<TTimeSelection>(options[0])

  useEffect(() => {
    setSelected(options[0])
  }, [])

  const handleSelect = (option: TTimeSelection) => {
    setSelected(option as TTimeSelection)
    onSelect(option)
    setIsOpen(false)
  }

  return (
    <div className='dropdown'>
      <button className='dropdown-toggle' onClick={() => setIsOpen(!isOpen)}>
        {selected}
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          &#9662;
        </span>
      </button>
      {isOpen && (
        <ul className='dropdown-menu'>
          {options.map((option, index) => {
            if (selected !== option)
              return (
                <li key={index} onClick={() => handleSelect(option)}>
                  {option}
                </li>
              )
          })}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
