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
 * - "Coffee $5 2025-01-30" (YYYY-MM-DD)
 * - "Lunch $12 01/30/2025" (MM/DD/YYYY)
 * - "Dinner $25 30/01/2025" (DD/MM/YYYY)
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

  // STEP 1: Extract date first (to avoid date numbers interfering with amount extraction)
  let expenseDate = null;
  let inputWithoutDate = normalizedInput;

  // 1. Try to match YYYY-MM-DD format (e.g., 2025-01-30)
  const isoDateRegex = /\b(\d{4})-(\d{2})-(\d{2})\b/;
  const isoDateMatch = normalizedInput.match(isoDateRegex);

  if (isoDateMatch) {
    const parsedDate = moment(isoDateMatch[0], 'YYYY-MM-DD', true);
    if (parsedDate.isValid()) {
      expenseDate = parsedDate.format('YYYY-MM-DD');
      inputWithoutDate = normalizedInput.replace(isoDateMatch[0], '').trim();
    }
  }

  // 2. Try to match MM/DD/YYYY format (e.g., 01/30/2025)
  if (!expenseDate) {
    const usDateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
    const usDateMatch = normalizedInput.match(usDateRegex);

    if (usDateMatch) {
      const parsedDate = moment(usDateMatch[0], 'MM/DD/YYYY', true);
      if (parsedDate.isValid()) {
        expenseDate = parsedDate.format('YYYY-MM-DD');
        inputWithoutDate = normalizedInput.replace(usDateMatch[0], '').trim();
      }
    }
  }

  // 3. Try to match DD/MM/YYYY format (e.g., 30/01/2025)
  if (!expenseDate) {
    const euDateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
    const euDateMatch = normalizedInput.match(euDateRegex);

    if (euDateMatch) {
      const parsedDate = moment(euDateMatch[0], 'DD/MM/YYYY', true);
      if (parsedDate.isValid()) {
        expenseDate = parsedDate.format('YYYY-MM-DD');
        inputWithoutDate = normalizedInput.replace(euDateMatch[0], '').trim();
      }
    }
  }

  // 4. Try to match date keywords (yesterday, today)
  if (!expenseDate) {
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
    expenseDate = moment().add(dateOffset, 'days').format('YYYY-MM-DD');

    if (dateKeywordFound) {
      inputWithoutDate = normalizedInput.replace(new RegExp(`\\b${dateKeywordFound}\\b`, 'i'), '').trim();
    }
  }

  // STEP 2: Extract amount from string with date removed
  // This prevents date numbers from being matched as amounts
  const amountRegex = /\$?(\d+\.?\d*)/;
  const amountMatch = inputWithoutDate.match(amountRegex);

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

  // STEP 3: Extract description by removing amount from the date-free string
  let description = inputWithoutDate
    // Remove the amount (with or without $)
    .replace(amountMatch[0], '')
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
    'Dinner $30 2025-01-30',
    '2025-01-15 Groceries $50',
    '01/20/2025 Movie $15',
  ];
};
