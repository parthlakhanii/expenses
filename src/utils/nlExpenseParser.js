import moment from 'moment';

/**
 * Natural Language Expense Parser
 * Parses natural language input like "Coffee $5" or "$20 lunch yesterday"
 * into structured expense data
 *
 * Supported patterns:
 * - "Coffee $5"
 * - "$20 lunch"
 * - "15.50 uber"
 * - "coffee 5"
 * - "Coffee $5 yesterday"
 * - "$20 lunch today"
 */

const DATE_KEYWORDS = {
  today: 0,
  yesterday: -1,
};

/**
 * Parse natural language expense input
 * @param {string} inputText - Natural language input like "Coffee $5"
 * @returns {object} - Parsed expense data or error
 */
export const parseExpenseInput = (inputText) => {
  // Validate input
  if (!inputText || typeof inputText !== 'string') {
    return {
      isValid: false,
      error: 'Please enter an expense (e.g., "Coffee $5")',
    };
  }

  // Trim and normalize input
  const normalizedInput = inputText.trim();

  if (normalizedInput.length === 0) {
    return {
      isValid: false,
      error: 'Please enter an expense (e.g., "Coffee $5")',
    };
  }

  // Extract amount - match numbers with optional $ prefix and decimal points
  // Pattern: optional $, followed by digits, optional decimal point and more digits
  const amountRegex = /\$?(\d+\.?\d*)/;
  const amountMatch = normalizedInput.match(amountRegex);

  if (!amountMatch) {
    return {
      isValid: false,
      error: 'Please include an amount (e.g., "$5" or "5.50")',
    };
  }

  const amount = parseFloat(amountMatch[1]);

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0',
    };
  }

  // Extract date keyword (yesterday, today)
  let dateOffset = 0; // Default to today
  let dateKeywordFound = null;

  for (const [keyword, offset] of Object.entries(DATE_KEYWORDS)) {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keywordRegex.test(normalizedInput)) {
      dateOffset = offset;
      dateKeywordFound = keyword;
      break;
    }
  }

  // Calculate date
  const expenseDate = moment().add(dateOffset, 'days').format('YYYY-MM-DD');

  // Extract description by removing amount and date keyword
  let description = normalizedInput
    // Remove the amount (with or without $)
    .replace(amountMatch[0], '')
    // Remove date keyword if found
    .replace(dateKeywordFound ? new RegExp(`\\b${dateKeywordFound}\\b`, 'i') : '', '')
    // Trim extra spaces
    .trim()
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ');

  // Validate description
  if (!description || description.length < 2) {
    return {
      isValid: false,
      error: 'Please include a description (e.g., "Coffee", "Lunch")',
    };
  }

  // Capitalize first letter of description
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    isValid: true,
    amount: amount,
    description: description,
    date: expenseDate,
    type: 'Expense', // Default type
    error: null,
  };
};

/**
 * Get example placeholders for the input field
 * @returns {array} - Array of example inputs
 */
export const getExamplePlaceholders = () => {
  return [
    'Coffee $5',
    '$20 lunch',
    '15.50 uber',
    'Gas 45 yesterday',
    '$8 snack today',
  ];
};
