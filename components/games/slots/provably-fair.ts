import { createHash, randomBytes } from 'crypto';
import { SYMBOLS } from './types';

export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}

export function generateClientSeed(): string {
  return randomBytes(16).toString('hex');
}

export function generateHash(serverSeed: string, clientSeed: string, nonce: number): string {
  const message = `${serverSeed}:${clientSeed}:${nonce}`;
  return createHash('sha256').update(message).digest('hex');
}

export function hashToNumbers(hash: string, count: number): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    // Take 2 bytes (4 hex chars) for each number
    const slice = hash.slice(i * 4, (i + 1) * 4);
    const decimal = parseInt(slice, 16);
    // Map to symbol index (0 to SYMBOLS.length - 1)
    numbers.push(decimal % SYMBOLS.length);
  }
  return numbers;
}

export function verifyResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  result: number[]
): boolean {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  const expectedNumbers = hashToNumbers(hash, result.length);
  return JSON.stringify(expectedNumbers) === JSON.stringify(result);
}

export function generateSpinResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number[] {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  // Generate 9 numbers for a 3x3 grid
  return hashToNumbers(hash, 9);
} 