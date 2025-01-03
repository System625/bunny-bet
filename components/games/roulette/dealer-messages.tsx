'use client'

interface DealerMessagesProps {
  message: string
  previousNumbers: number[]
}

export function DealerMessages({ message, previousNumbers }: DealerMessagesProps) {
  const getNumberColor = (num: number) => {
    if (num === 0) return 'text-green-500'
    return [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      .includes(num) ? 'text-red-500' : 'text-black'
  }

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-green-900/20 rounded-lg">
        <p className="text-lg font-medium">{message}</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Previous Numbers</h3>
        <div className="flex gap-2">
          {previousNumbers.map((num, i) => (
            <div
              key={i}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                font-bold ${getNumberColor(num)} bg-white
              `}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 