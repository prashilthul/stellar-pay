# Stellar Payment App - White Belt Challenge

A modern, feature-rich Stellar payment dApp built for the Stellar White Belt Challenge. This application demonstrates wallet connection, balance display, and XLM transactions on the Stellar Testnet.

## 🚀 Features

- **Wallet Connection**: Connect/disconnect Stellar wallets with support for multiple providers (Freighter, xBull, Albedo, Rabet, Lobstr, Hana, WalletConnect)
- **Balance Display**: Real-time XLM balance display with USD conversion
- **Send Payments**: Send XLM payments with memo support and transaction confirmation
- **Transaction History**: View recent transactions with detailed information
- **Network Status**: Real-time network monitoring with ledger info and latency
- **Account Information**: Detailed account info including signers and thresholds
- **Responsive Design**: Beautiful, responsive UI with dark theme
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Real-time validation with helpful feedback
- **Wallet Persistence**: Automatic wallet reconnection using localStorage

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Stellar SDK (@stellar/stellar-sdk)
- **Wallet Integration**: Stellar Wallets Kit (@creit.tech/stellar-wallets-kit)
- **Icons**: React Icons

## 📋 Prerequisites

- Node.js 18+ installed
- A Stellar wallet (we recommend [Freighter](https://www.freighter.app/))
- Testnet XLM (get it from [StellarTerm Faucet](https://stellarterm.com/testnet/xlm-native))

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd stellar-payment-app
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

### Building for Production

```bash
npm run build
npm start
```

## 📖 Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button
2. Select your preferred wallet from the modal
3. Approve the connection in your wallet
4. Your wallet will be connected and balance will be displayed

### Sending XLM

1. Make sure your wallet is connected
2. Enter the recipient's Stellar address (starts with 'G' and is 56 characters)
3. Enter the amount of XLM to send
4. Optionally add a memo (max 28 characters)
5. Click "Send Payment"
6. Confirm the transaction in your wallet
7. View the transaction result with hash

### Viewing Transaction History

- Recent transactions are automatically displayed after connecting your wallet
- Click on any transaction to view it on Stellar Expert
- Transactions show sent/received status, amount, and timestamp

## 🎯 Requirements Met

✅ **Wallet Setup**
- Freighter wallet integration
- Stellar Testnet support

✅ **Wallet Connection**
- Connect functionality with multiple wallet support
- Disconnect functionality
- Wallet persistence with localStorage

✅ **Balance Handling**
- Fetch connected wallet's XLM balance
- Display balance clearly in the UI
- USD conversion display

✅ **Transaction Flow**
- Send XLM transactions on Stellar testnet
- Success/failure state feedback
- Transaction hash display
- Explorer links for verification

✅ **Development Standards**
- Clean, maintainable code structure
- Comprehensive error handling
- TypeScript for type safety
- Responsive design
- User-friendly interface

## 📁 Project Structure

```
stellar-payment-app/
├── app/
│   ├── favicon.ico
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application page
├── components/
│   ├── AccountInfo.tsx      # Account information display
│   ├── BalanceDisplay.tsx   # Balance display with USD conversion
│   ├── NetworkStatus.tsx    # Network status monitoring
│   ├── PaymentForm.tsx     # Payment form with validation
│   ├── TransactionHistory.tsx # Transaction history display
│   └── WalletConnection.tsx # Wallet connection component
├── lib/
│   └── stellar-helper.ts    # Stellar blockchain helper
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── next.config.ts           # Next.js configuration
```

## 🔧 Configuration

### Environment Variables

The app uses Stellar Testnet by default. To switch to mainnet, modify the `stellar-helper.ts` file:

```typescript
export const stellar = new StellarHelper('mainnet'); // Change from 'testnet'
```

### Network Configuration

Network settings are configured in `lib/stellar-helper.ts`:

```typescript
private readonly NETWORKS = {
  testnet: {
    horizon: 'https://horizon-testnet.stellar.org',
    passphrase: StellarSdk.Networks.TESTNET,
    walletNetwork: WalletNetwork.TESTNET,
    explorer: 'testnet'
  },
  mainnet: {
    horizon: 'https://horizon.stellar.org',
    passphrase: StellarSdk.Networks.PUBLIC,
    walletNetwork: WalletNetwork.PUBLIC,
    explorer: 'public'
  }
};
```

## 🧪 Testing

The application has been tested with:

- ✅ Wallet connection/disconnection
- ✅ Balance fetching and display
- ✅ Payment sending with various amounts
- ✅ Transaction history display
- ✅ Error handling for invalid inputs
- ✅ Network status monitoring
- ✅ Responsive design on different screen sizes

## 📸 Screenshots

### Wallet Connected State
- Connected wallet address displayed
- Real-time balance shown
- Network status indicator

### Balance Display
- XLM balance with USD conversion
- Quick access to faucets
- Account information

### Transaction Flow
- Payment form with validation
- Transaction confirmation
- Success message with hash

## 🌐 Useful Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar Testnet Faucet](https://stellarterm.com/testnet/xlm-native)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar Expert](https://stellar.expert/)

## 🤝 Contributing

This project was built for the Stellar White Belt Challenge. Feel free to fork and modify for your own use!

## 📝 License

This project is open source and available under the MIT License.

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Stellar Documentation](https://developers.stellar.org/)
2. Visit the [Stellar Community](https://stellar.org/community/)
3. Open an issue in the repository