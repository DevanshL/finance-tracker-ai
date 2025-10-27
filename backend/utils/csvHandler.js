/**
 * Convert transactions to CSV format
 */
const transactionsToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Amount',
    'Description',
    'Payment Method',
    'Tags',
    'Notes'
  ];

  // Convert transactions to rows
  const rows = transactions.map(t => {
    return [
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      t.category,
      t.amount,
      t.description || '',
      t.paymentMethod || '',
      (t.tags || []).join(';'),
      t.notes || ''
    ].map(field => {
      // Escape fields that contain commas, quotes, or newlines
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    }).join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Parse CSV string to transaction objects
 */
const csvToTransactions = (csvString) => {
  if (!csvString || csvString.trim() === '') {
    throw new Error('CSV string is empty');
  }

  const lines = csvString.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have headers and at least one data row');
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Required fields
  const requiredFields = ['date', 'type', 'category', 'amount'];
  const missingFields = requiredFields.filter(f => !headers.includes(f));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Parse data rows
  const transactions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic cases)
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    // Map values to transaction object
    const transaction = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      switch (header) {
        case 'date':
          transaction.date = new Date(value);
          break;
        case 'type':
          transaction.type = value.toLowerCase();
          break;
        case 'amount':
          transaction.amount = parseFloat(value);
          break;
        case 'category':
          transaction.category = value;
          break;
        case 'description':
          transaction.description = value;
          break;
        case 'payment method':
        case 'paymentmethod':
          transaction.paymentMethod = value;
          break;
        case 'tags':
          transaction.tags = value ? value.split(';').map(t => t.trim()) : [];
          break;
        case 'notes':
          transaction.notes = value;
          break;
      }
    });

    // Validate transaction
    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      throw new Error(`Row ${i}: Invalid type "${transaction.type}"`);
    }
    if (!transaction.amount || isNaN(transaction.amount) || transaction.amount <= 0) {
      throw new Error(`Row ${i}: Invalid amount "${values[headers.indexOf('amount')]}"`);
    }
    if (!transaction.category) {
      throw new Error(`Row ${i}: Category is required`);
    }
    if (!transaction.date || isNaN(transaction.date.getTime())) {
      throw new Error(`Row ${i}: Invalid date "${values[headers.indexOf('date')]}"`);
    }

    transactions.push(transaction);
  }

  return transactions;
};

module.exports = {
  transactionsToCSV,
  csvToTransactions
};