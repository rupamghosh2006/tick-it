import { Horizon, Keypair, Networks } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export const horizonServer = new Horizon.Server(HORIZON_URL);

export const NETWORK = Networks.TESTNET;
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const CONTRACT_ID = 'CBPNZIJXF4TTTWRNEYRQTRUINLRTB6VODMFUDVEBHH2BSXHPOAFUHPDH';
export const NFT_CONTRACT_ID = 'CCPOFIZOXLZIGQ5JRZMVYSLBKCSEV66YS6DOGYMH6LGI5HVQ5X4IX2OF';

export const fromString = (amount: string): bigint => {
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const fractional = parts[1] || '';
  const padded = fractional.padEnd(7, '0').slice(0, 7);
  return BigInt(whole + padded);
};

export const toString = (amount: bigint): string => {
  const str = amount.toString().padStart(8, '0');
  const whole = str.slice(0, -7) || '0';
  const fractional = str.slice(-7);
  const trimmed = fractional.replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
};
