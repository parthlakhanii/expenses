# Personal Finance & Expense Tracker

A React-based personal finance dashboard for tracking expenses across multiple financial accounts and integrating with Splitwise for shared expenses.

## Features

- **Multi-source CSV Import** - Import transactions from:
  - Scotia Momentum Credit Card
  - Scotia Bank Account
  - Wealthsimple Cash
  - Wealthsimple TFSA
  - CIBC Credit Card

- **Splitwise Integration** - Sync shared expenses and view personal owed shares
- **Monthly View** - Browse expenses by month and year with an intuitive date picker
- **Real-time Statistics** - View totals for expenses, income, investments, and other transactions
- **Inline Editing** - Edit expense details directly in the table
- **Category Management** - Organize transactions by type and category

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server (running on port 3001 by default)

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd expenses
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update with your values:
   - `REACT_APP_API_URL` - Your backend API URL (default: http://localhost:3001)
   - `REACT_APP_USER_NAME` - Your Splitwise username
   - `REACT_APP_USER_ID` - Your Splitwise user ID

4. **Start the development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Frontend**: React 18.3.1
- **UI Library**: Ant Design 5.17.3
- **HTTP Client**: Axios 0.24.0
- **Date Handling**: Moment.js 2.30.1
- **Build Tool**: Create React App

## Project Structure

```
expenses/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── AddExpense.js
│   │   ├── ExpenseList.js
│   │   ├── ExpenseTotal.js
│   │   ├── ProcessCsv.js
│   │   ├── ImportFromSW.js
│   │   └── SideMenu.js
│   ├── pages/            # Page components
│   │   └── Dashboard.js
│   ├── services/         # API service layer
│   │   └── expenseService.js
│   ├── styles/           # CSS and assets
│   └── App.js
├── public/
├── .env.example          # Environment variable template
└── SECURITY.md          # Security documentation
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Security

- **Environment Variables**: Never commit your `.env` file
- **API Keys**: Ensure your backend properly secures Splitwise API keys
- **Data Privacy**: All financial data is stored locally in your backend database

See [SECURITY.md](./SECURITY.md) for detailed security information.

## Usage

1. **Import CSV**: Click the floating action button → Import CSV → Select your bank and upload the CSV file
2. **Sync Splitwise**: Click the floating action button → Sync Splitwise → Select date range
3. **Add Manual Expense**: Click the floating action button → Add Expense
4. **Change Month/Year**: Click the date picker in the header to navigate between months
5. **Edit Expenses**: Click on any field in the Dashboard view to edit inline
6. **Delete Expenses**: Click the delete icon on any expense row

## Contributing

This is a personal project, but contributions are welcome! Please ensure:
- No hardcoded credentials or API keys
- Follow existing code style
- Test changes locally before submitting

## License

This project is for personal use.

## Troubleshooting

**App won't start**: Ensure you've created a `.env` file with required variables

**API connection errors**: Verify your backend is running on the configured `REACT_APP_API_URL`

**Splitwise sync not working**: Check your `REACT_APP_USER_NAME` and `REACT_APP_USER_ID` are correct

## Future Improvements

- Add authentication/multi-user support
- Implement proper state management (Redux/Context API)
- Add comprehensive testing
- Create production build configuration
- Add budget tracking features
- Export data functionality
