# Security Considerations

## Environment Variables

This project uses environment variables to store sensitive configuration. Before running the application:

1. Copy `.env.example` to `.env`
2. Update the values in `.env` with your actual credentials

```bash
cp .env.example .env
```

## Required Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001)
- `REACT_APP_USER_NAME` - Your Splitwise username
- `REACT_APP_USER_ID` - Your Splitwise user ID

## Important Security Notes

1. **Never commit `.env` file** - The `.env` file is git-ignored and contains your personal credentials
2. **API Keys** - This app connects to a backend API that handles Splitwise authentication. Ensure your backend properly secures API keys
3. **Local Development Only** - This frontend is configured for local development. For production deployment, ensure:
   - Use HTTPS for all API communications
   - Implement proper authentication/authorization
   - Use environment-specific configuration
   - Enable CORS only for trusted domains

## Data Privacy

This application processes:
- Bank transaction data from CSV imports
- Splitwise shared expense data
- Personal financial information

All data is stored in your local backend database. Ensure your backend has appropriate security measures in place.

## Reporting Security Issues

If you find a security vulnerability, please report it by creating a private issue on GitHub.
