const { sanitizeCSVCell, formatCSVRow } = require('../../src/utils/csv.utils');

describe('CSV Serialization & Formula Injection Protection (Phase 3 Audit)', () => {
  describe('1. Legitimate Numeric Values Preservation', () => {
    it('preserves positive numbers as plain numeric strings without prepending quotes', () => {
      expect(sanitizeCSVCell(42)).toBe('42');
      expect(sanitizeCSVCell(0)).toBe('0');
      expect(sanitizeCSVCell(99.9)).toBe('99.9');
    });

    it('preserves legitimate negative numbers as numbers without prepending quotes', () => {
      expect(sanitizeCSVCell(-5)).toBe('-5');
      expect(sanitizeCSVCell(-12.5)).toBe('-12.5');
      expect(sanitizeCSVCell(-0.01)).toBe('-0.01');
    });

    it('preserves valid negative numeric strings without prepending quotes', () => {
      expect(sanitizeCSVCell('-5')).toBe('-5');
      expect(sanitizeCSVCell('-42.15')).toBe('-42.15');
      expect(sanitizeCSVCell('0')).toBe('0');
      expect(sanitizeCSVCell('100')).toBe('100');
    });
  });

  describe('2. Formula Injection Neutralization', () => {
    it('neutralizes values starting with equals sign (=)', () => {
      expect(sanitizeCSVCell('=1+1')).toBe("'=1+1");
      expect(sanitizeCSVCell('=cmd|"/C calc"!A0')).toBe("\"'=cmd|\"\"/C calc\"\"!A0\"");
      expect(sanitizeCSVCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    });

    it('neutralizes values starting with at sign (@)', () => {
      expect(sanitizeCSVCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
      expect(sanitizeCSVCell('@eval(alert(1))')).toBe("'@eval(alert(1))");
    });

    it('neutralizes formula strings starting with plus (+)', () => {
      expect(sanitizeCSVCell('+1+1')).toBe("'+1+1");
      expect(sanitizeCSVCell('+A1')).toBe("'+A1");
    });

    it('neutralizes non-numeric formula strings starting with minus (-)', () => {
      expect(sanitizeCSVCell('-2+3*cmd|"/C calc"!A0')).toBe("\"'-2+3*cmd|\"\"/C calc\"\"!A0\"");
      expect(sanitizeCSVCell('-A1')).toBe("'-A1");
      expect(sanitizeCSVCell('-')).toBe("'-");
    });

    it('neutralizes formula injection strings with leading spaces or tabs', () => {
      expect(sanitizeCSVCell('   =1+1')).toBe("'   =1+1");
      expect(sanitizeCSVCell('\t=2+2')).toBe("'\t=2+2");
      expect(sanitizeCSVCell('  @evil')).toBe("'  @evil");
      expect(sanitizeCSVCell('  -evil()')).toBe("'  -evil()");
    });
  });

  describe('3. RFC 4180 Delimiter & Quoting Escapes', () => {
    it('wraps values containing commas in double quotes', () => {
      expect(sanitizeCSVCell('Full Stack, Frontend')).toBe('"Full Stack, Frontend"');
    });

    it('escapes internal double quotes by doubling them', () => {
      expect(sanitizeCSVCell('He said "Hello"')).toBe('"He said ""Hello"""');
    });

    it('wraps values with newlines (LF or CRLF) in double quotes', () => {
      expect(sanitizeCSVCell("Line 1\nLine 2")).toBe("\"Line 1\nLine 2\"");
      expect(sanitizeCSVCell("Line 1\r\nLine 2")).toBe("\"Line 1\r\nLine 2\"");
    });

    it('properly handles values combining commas, quotes, and newlines', () => {
      const complex = 'Item 1, with "Quotes"\nand newline';
      expect(sanitizeCSVCell(complex)).toBe('"Item 1, with ""Quotes""\nand newline"');
    });
  });

  describe('4. Null, Undefined & Empty Values', () => {
    it('returns default fallback for null and undefined', () => {
      expect(sanitizeCSVCell(null)).toBe('');
      expect(sanitizeCSVCell(undefined)).toBe('');
      expect(sanitizeCSVCell(null, 'N/A')).toBe('N/A');
      expect(sanitizeCSVCell(undefined, 'N/A')).toBe('N/A');
    });

    it('handles empty strings cleanly', () => {
      expect(sanitizeCSVCell('')).toBe('');
    });
  });

  describe('5. Row Formatting (formatCSVRow)', () => {
    it('joins multiple sanitized values into a valid CSV line', () => {
      const row = formatCSVRow(['Alice', 'CS', 2024, -5, '=1+1', 'Has, comma']);
      expect(row).toBe('Alice,CS,2024,-5,\'=1+1,"Has, comma"');
    });

    it('handles empty or null row values with fallback', () => {
      const row = formatCSVRow(['Bob', null, undefined, 42], 'N/A');
      expect(row).toBe('Bob,N/A,N/A,42');
    });
  });
});
