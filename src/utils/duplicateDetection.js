/**
 * Client-side duplicate detection
 * Matches the server-side logic for consistency
 */

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  // Normalize strings (lowercase, trim)
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // If exact match, return 1
  if (s1 === s2) return 1;

  // Calculate Levenshtein distance
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Levenshtein distance algorithm
 * Measures the minimum number of single-character edits needed
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Find potential duplicate transactions against existing expenses
 * Matching criteria: same date + same amount + similar description (>=85%)
 */
export const findDuplicates = async (transactions, existingExpenses) => {
  const duplicates = [];
  const duplicateSet = new Set();

  for (const txn of transactions) {
    // Find candidates with same date and amount
    const candidates = existingExpenses.filter(
      expense => expense.date === txn.date && Math.abs(expense.amount - txn.amount) < 0.01
    );

    if (candidates.length === 0) {
      continue;
    }

    // Check description similarity for each candidate
    for (const candidate of candidates) {
      const similarity = calculateStringSimilarity(
        txn.description,
        candidate.description
      );

      // Consider it a duplicate if 85% similar or more
      if (similarity >= 0.85) {
        const key = `${txn.date}-${txn.amount}-${txn.description}`;
        if (!duplicateSet.has(key)) {
          duplicates.push({
            newTransaction: txn,
            existingTransaction: candidate,
            confidence: similarity,
            matchReason: 'Date + Amount + Description match'
          });
          duplicateSet.add(key);
        }
        break;  // Found a duplicate, no need to check more candidates
      }
    }
  }

  return duplicates;
};

/**
 * Mark transactions as duplicates in the dataset
 */
export const markDuplicates = (transactions, duplicates) => {
  const duplicateKeys = new Set(
    duplicates.map(d =>
      `${d.newTransaction.date}-${d.newTransaction.amount}-${d.newTransaction.description}`
    )
  );

  return transactions.map(txn => ({
    ...txn,
    isDuplicate: duplicateKeys.has(
      `${txn.date}-${txn.amount}-${txn.description}`
    )
  }));
};
