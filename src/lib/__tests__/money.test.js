import { formatMoney, parseAmount } from '../money';

// U+2212 MINUS SIGN — the exact char money.js uses for negatives (not ASCII '-').
const MINUS = '−';

describe('formatMoney', () => {
  it('formats zero and small amounts without grouping', () => {
    expect(formatMoney(0)).toBe('₹0');
    expect(formatMoney(250)).toBe('₹250');
  });

  it('groups thousands and uses Indian (2-2-3) grouping for large amounts', () => {
    expect(formatMoney(1000)).toBe('₹1,000');
    expect(formatMoney(100000)).toBe('₹1,00,000');
    expect(formatMoney(123456.78)).toBe('₹1,23,456.78');
  });

  it('drops decimals on round numbers but keeps them otherwise', () => {
    expect(formatMoney(1200.0)).toBe('₹1,200');
    expect(formatMoney(1200.5)).toBe('₹1,200.50');
  });

  it('renders negatives with the U+2212 minus sign', () => {
    expect(formatMoney(-500)).toBe(`${MINUS}₹500`);
  });

  it('with { sign: true } always shows + / − and a space', () => {
    expect(formatMoney(250, { sign: true })).toBe('+ ₹250');
    expect(formatMoney(-250, { sign: true })).toBe(`${MINUS} ₹250`);
  });

  it('coerces non-numbers to ₹0', () => {
    expect(formatMoney('abc')).toBe('₹0');
    expect(formatMoney(null)).toBe('₹0');
    expect(formatMoney(undefined)).toBe('₹0');
  });
});

describe('parseAmount', () => {
  it('strips currency symbols and grouping commas', () => {
    expect(parseAmount('1,200.50')).toBe(1200.5);
    expect(parseAmount('₹300')).toBe(300);
  });

  it('returns 0 for empty / nullish / non-numeric input', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount('abc')).toBe(0);
  });

  it('strips a leading minus (amounts are always positive; type sets direction)', () => {
    expect(parseAmount('-50')).toBe(50);
  });
});
