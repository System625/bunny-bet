'use client'

interface BettingControlsProps {
  selectedChip: number
  onChipSelect: (value: number) => void
}

export function BettingControls({ selectedChip, onChipSelect }: BettingControlsProps) {
  const chipValues = [1, 5, 10, 25, 100, 500]

  return (
    <div className="flex flex-wrap gap-2">
      {chipValues.map((value) => (
        <button
          key={value}
          onClick={() => onChipSelect(value)}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            font-bold text-sm border-2
            ${selectedChip === value 
              ? 'border-yellow-400 bg-yellow-500 text-black' 
              : 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
            }
          `}
        >
          ${value}
        </button>
      ))}
    </div>
  )
} 