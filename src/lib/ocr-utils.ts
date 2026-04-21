/**
 * Rule-based text cleanup for OCR results
 */
export const cleanOCRText = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove extra non-printable characters and noise often found in OCR
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // 2. Normalize whitespace: reduce multiple spaces to a single space
  cleaned = cleaned.replace(/[ ]+/g, ' ');

  // 3. Merge broken words at line breaks (e.g., "word-\nbreak" -> "wordbreak")
  cleaned = cleaned.replace(/(\w+)-\s*[\r\n]+\s*(\w+)/g, '$1$2');

  // 4. Fix line breaks: reduce multiple line breaks to a maximum of two (paragraphs)
  // and remove single line breaks that break up sentences
  cleaned = cleaned.replace(/[\r\n]{3,}/g, '\n\n');
  
  // Try to identify single newlines that should be spaces (mid-sentence)
  // We look for a lowercase letter or digit before the newline and a lowercase letter after
  cleaned = cleaned.replace(/([a-z0-9])[\r\n]([a-z])/g, '$1 $2');

  // 5. Normalize punctuation
  cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1'); // Remove space before punctuation
  cleaned = cleaned.replace(/([.,!?;:])([A-Za-z])/g, '$1 $2'); // Add space after punctuation if missing

  // 6. Capitalize sentences
  cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, char) => {
    return separator + char.toUpperCase();
  });

  // 7. Remove common noise characters at start/end of lines
  cleaned = cleaned.split('\n').map(line => {
    return line.trim().replace(/^[^a-zA-Z0-9\s]+|[^a-zA-Z0-9\s.!?]+$/g, '').trim();
  }).join('\n');

  // Final trim and whitespace cleanup
  return cleaned.trim();
};

/**
 * Standardize language selection for Tesseract
 */
export const getOCRSelection = (lang: string): string => {
  if (lang === 'auto') return 'eng'; // Default for auto-detect phase 1
  if (lang === 'mixed') return 'eng+hin';
  return lang;
};
