# PayPal Fee Calculator

A modern, responsive PayPal fee calculator built with Next.js, TypeScript, and Tailwind CSS. Calculate PayPal fees instantly and find out exactly how much to request to receive your desired amount after fees.

## Features

### Core Functionality
- **Real-time Fee Calculation**: Instantly calculate PayPal fees as you type
- **Multiple Transaction Types**: Support for Domestic, International, and Micropayment fees
- **Reverse Calculation**: Find out how much to request to receive a specific amount after fees
- **Multi-Currency Support**: USD, EUR, GBP, CAD, AUD, JPY

### Advanced Features
- **Batch Calculator**: Calculate fees for multiple transactions at once
- **Transaction History**: Automatically saves your last 10 calculations
- **Dark Mode**: Toggle between light and dark themes
- **Quick Amount Presets**: One-click buttons for common amounts
- **Copy to Clipboard**: Easily copy calculated amounts
- **Visual Fee Breakdown**: See fee percentages with progress bars
- **Mobile Responsive**: Works perfectly on all device sizes

## Fee Structures

### Domestic Transactions (US)
- **Standard**: 2.9% + $0.30
- **Micropayments** (< $10): 5% + $0.05

### International Transactions
- **Standard**: 4.4% + $0.30

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd paypal-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
paypal-calculator/
├── app/
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── Calculator.tsx    # Main calculator component
│   ├── ResultsDisplay.tsx # Results display component
│   ├── BatchCalculator.tsx # Batch calculation component
│   └── ThemeToggle.tsx   # Dark mode toggle
├── lib/
│   ├── calculations.ts   # Fee calculation logic
│   └── constants.ts      # Fee rates and constants
└── public/              # Static assets
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: Inter (Google Fonts)
- **Icons**: Heroicons (inline SVG)

## Key Features Explained

### Reverse Calculation
The calculator automatically shows you how much you need to request from someone to receive your desired amount after PayPal deducts their fees. This uses the formula:
```
Amount to Request = (Desired Amount + Fixed Fee) / (1 - Percentage Fee)
```

### Batch Processing
Process multiple amounts at once by entering them separated by commas or new lines. The batch calculator shows:
- Total original amount
- Total fees
- Total net amount
- Individual calculation breakdown

### Local Storage
Your calculation history is automatically saved to your browser's local storage, persisting across sessions. Clear history anytime with the Clear button.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Disclaimer

This calculator provides estimates based on publicly available PayPal fee information. Actual fees may vary based on your account type, country, and specific PayPal agreements. Always verify with PayPal's official fee schedule.

## Future Enhancements

- [ ] Export calculations to PDF/CSV
- [ ] Currency conversion with live rates
- [ ] Invoice generator
- [ ] Fee comparison with other payment processors
- [ ] API for developers
- [ ] Multi-language support
- [ ] PWA capabilities for offline use
- [ ] Business vs Personal account fee differences

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.