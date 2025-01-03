# BunnyBet 🎰

BunnyBet is a modern cryptocurrency-based casino platform built with Next.js, featuring various casino games with a focus on provably fair gaming.

## Features

- 🎲 **Casino Games**
  - Roulette (European/American style)
  - More games coming soon!
  
- 💰 **Cryptocurrency Integration**
  - Web3 wallet connection
  - Crypto-based betting system
  
- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/light theme support
  - Beautiful animations
  - Shadcn UI components

## Tech Stack

- **Frontend**: Next.js 15.1.3, React 19
- **Styling**: TailwindCSS
- **Web3**: Ethers.js
- **State Management**: React Context
- **Theme**: Next-themes
- **UI Components**: Shadcn UI, Radix UI

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bunny-bet.git
cd bunny-bet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_NETWORK_ID=1  # Ethereum Mainnet
```

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable UI components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and configurations
- `/public` - Static assets

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
