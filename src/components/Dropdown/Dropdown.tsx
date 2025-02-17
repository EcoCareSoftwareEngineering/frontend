import { useState } from 'react'
import './Dropdown.scss'

const Dropdown = ({
  options,
  onSelect,
}: {
  options: string[]
  onSelect: (value: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(options[0])

  const handleSelect = (option: string) => {
    setSelected(option)
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
