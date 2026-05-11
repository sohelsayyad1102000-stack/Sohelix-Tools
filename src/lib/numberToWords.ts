/**
 * Converts a number to words in the Indian numbering system (Lakhs, Crores).
 * Specifically designed for Indian Currency (Rupees).
 */
export function convertNumberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const format = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + format(n % 100) : '');
    return '';
  };

  const makeWords = (n: number): string => {
    let result = '';

    // Crores
    if (n >= 10000000) {
      result += makeWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }

    // Lakhs
    if (n >= 100000) {
      result += format(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }

    // Thousands
    if (n >= 1000) {
      result += format(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }

    // Remaining hundreds and below
    if (n > 0) {
      result += format(n);
    }

    return result.trim();
  };

  const words = makeWords(num);
  return `${words} Rupees Only`.replace(/\s+/g, ' ');
}

/**
 * Basic International Number to Words conversion (Millions, Billions).
 */
export function convertNumberToInternationalWords(num: number, currencyName: string = 'Dollars'): string {
  if (num === 0) return `Zero ${currencyName} Only`;

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const format = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + format(n % 100) : '');
    return '';
  };

  const makeWords = (n: number): string => {
    let result = '';

    if (n >= 1000000000) {
      result += format(Math.floor(n / 1000000000)) + ' Billion ';
      n %= 1000000000;
    }

    if (n >= 1000000) {
      result += format(Math.floor(n / 1000000)) + ' Million ';
      n %= 1000000;
    }

    if (n >= 1000) {
      result += format(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }

    if (n > 0) {
      result += format(n);
    }

    return result.trim();
  };

  const words = makeWords(num);
  return `${words} ${currencyName} Only`.replace(/\s+/g, ' ');
}
