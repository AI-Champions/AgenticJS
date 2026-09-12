import { z } from 'zod';

export const ORIGIN = 'https://agent-guild-5d5r.onrender.com';
export const MAX_BYTES = 65536;
export const MAX_PASSPORT_BYTES = 32768;

export class GuildError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export function requireValue(value: unknown, code: string): asserts value {
  if (!value) throw new GuildError(code);
}

export function record(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Reject non-JSON inputs before Zod or JSON.stringify could silently alter them.
// This also bounds recursion and rejects accessors without invoking their getters.
function jsonData(value: unknown, seen: Set<object>, depth = 0): void {
  requireValue(depth <= 16, 'invalid_credential');
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return;
  if (typeof value === 'number') {
    requireValue(Number.isFinite(value), 'invalid_credential');
    return;
  }
  requireValue(
    typeof value === 'object' && value !== null,
    'invalid_credential'
  );
  requireValue(!seen.has(value), 'invalid_credential');
  requireValue(Array.isArray(value) || record(value), 'invalid_credential');
  seen.add(value);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  requireValue(
    Object.getOwnPropertySymbols(value).length === 0,
    'invalid_credential'
  );
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (Array.isArray(value) && key === 'length') continue;
    requireValue(
      !['__proto__', 'constructor', 'prototype', 'toJSON'].includes(key) &&
        descriptor.enumerable &&
        'value' in descriptor,
      'invalid_credential'
    );
    jsonData(descriptor.value, seen, depth + 1);
  }
  if (Array.isArray(value)) {
    requireValue(
      Object.keys(value).length === value.length &&
        Object.keys(value).every((key, index) => key === String(index)),
      'invalid_credential'
    );
  }
  seen.delete(value);
}

export function credentialObject(value: unknown): Record<string, unknown> {
  requireValue(record(value), 'invalid_credential');
  jsonData(value, new Set());
  const serialized = JSON.stringify(value);
  requireValue(
    new TextEncoder().encode(serialized).length <= MAX_PASSPORT_BYTES,
    'invalid_credential'
  );
  return JSON.parse(serialized);
}

export const credentialSchema = z.preprocess((value, context) => {
  try {
    return credentialObject(value);
  } catch {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Expected a bounded public JSON credential object.',
    });
    return z.NEVER;
  }
}, z.record(z.unknown()));

export const didSchema = z
  .string()
  .regex(/^did:key:z[1-9A-HJ-NP-Za-km-z]{30,100}$/);

// Lexical screening only: a valid DNS name may still resolve to a private address.
export function endpoint(value: string): string {
  requireValue(
    value.length > 0 &&
      value.length <= 2048 &&
      !/[\s\\]/.test(value) &&
      [...value].every(
        (character) =>
          character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127
      ),
    'invalid_endpoint'
  );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new GuildError('invalid_endpoint');
  }
  requireValue(
    ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.hash,
    'invalid_endpoint'
  );
  // Restrict this operation to DNS hostnames; IP literals and legacy numeric IP forms are unsupported.
  const labels = url.hostname.split('.');
  requireValue(
    labels.length >= 2 &&
      labels.every((label) =>
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
      ) &&
      /^[a-z]{2,63}$/.test(labels[labels.length - 1]) &&
      ![
        'local',
        'localhost',
        'internal',
        'test',
        'invalid',
        'example',
        'onion',
        'home',
        'lan',
      ].includes(labels[labels.length - 1]),
    'invalid_endpoint'
  );
  // The original string is retained and submitted; parsing is never used to rewrite it.
  return url.hostname;
}

export function timestamp(value: unknown): number {
  requireValue(typeof value === 'string', 'invalid_credential_time');
  const match =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(?:Z|\+00:00)$/.exec(
      value
    );
  requireValue(match, 'invalid_credential_time');
  const millis = Date.parse(
    `${match[1]}.${(match[2] ?? '').padEnd(3, '0').slice(0, 3)}Z`
  );
  requireValue(
    Number.isFinite(millis) &&
      new Date(millis).toISOString().slice(0, 19) === match[1],
    'invalid_credential_time'
  );
  return millis;
}

export function passportBinding(
  credential: Record<string, unknown>,
  issuer: string,
  subject: string,
  maxAge: number,
  now: number
): void {
  requireValue(credential.issuer === issuer, 'issuer_mismatch');
  requireValue(
    record(credential.credentialSubject) &&
      credential.credentialSubject.id === subject,
    'subject_mismatch'
  );
  requireValue(
    Array.isArray(credential.type) &&
      credential.type.includes('VerifiableCredential') &&
      credential.type.includes('AgentGuildPassport'),
    'unsupported_credential'
  );
  const proof = credential.proof;
  requireValue(
    record(proof) &&
      proof.type === 'DataIntegrityProof' &&
      proof.cryptosuite === 'eddsa-jcs-2022',
    'unsupported_proof'
  );
  requireValue(
    proof.proofPurpose === 'assertionMethod' &&
      typeof proof.proofValue === 'string' &&
      /^z[1-9A-HJ-NP-Za-km-z]+$/.test(proof.proofValue),
    'unsupported_proof'
  );
  requireValue(
    proof.verificationMethod === `${issuer}#${issuer.slice(8)}`,
    'issuer_mismatch'
  );
  const from = timestamp(credential.validFrom);
  const until = timestamp(credential.validUntil);
  requireValue(
    from <= now && now < until && from < until,
    'credential_outside_validity'
  );
  requireValue(now - from <= maxAge * 1000, 'credential_stale');
}

// JSON.parse alone discards duplicate object keys. Reject ambiguity before projection.
export function strictJson(text: string): unknown {
  let offset = 0;
  function whitespace() {
    while (/\s/.test(text[offset] ?? '') && offset < text.length) offset++;
  }
  function string(): string {
    const start = offset++;
    while (offset < text.length) {
      if (text[offset++] === '"') return JSON.parse(text.slice(start, offset));
      if (text[offset - 1] === '\\') offset++;
    }
    throw new GuildError('invalid_response');
  }
  function value(depth = 0): void {
    requireValue(depth <= 24, 'invalid_response');
    whitespace();
    if (text[offset] === '"') {
      string();
      return;
    }
    if (text[offset] === '{') {
      offset++;
      whitespace();
      const keys = new Set<string>();
      if (text[offset] === '}') {
        offset++;
        return;
      }
      while (offset < text.length) {
        requireValue(text[offset] === '"', 'invalid_response');
        const key = string();
        requireValue(!keys.has(key), 'invalid_response');
        keys.add(key);
        whitespace();
        requireValue(text[offset++] === ':', 'invalid_response');
        value(depth + 1);
        whitespace();
        if (text[offset] === '}') {
          offset++;
          return;
        }
        requireValue(text[offset++] === ',', 'invalid_response');
        whitespace();
      }
    } else if (text[offset] === '[') {
      offset++;
      whitespace();
      if (text[offset] === ']') {
        offset++;
        return;
      }
      while (offset < text.length) {
        value(depth + 1);
        whitespace();
        if (text[offset] === ']') {
          offset++;
          return;
        }
        requireValue(text[offset++] === ',', 'invalid_response');
      }
    } else {
      const match =
        /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
          text.slice(offset)
        );
      requireValue(match, 'invalid_response');
      if (!['true', 'false', 'null'].includes(match[0]))
        requireValue(Number.isFinite(Number(match[0])), 'invalid_response');
      offset += match[0].length;
      return;
    }
    throw new GuildError('invalid_response');
  }
  try {
    value();
    whitespace();
    requireValue(offset === text.length, 'invalid_response');
    return JSON.parse(text);
  } catch {
    throw new GuildError('invalid_response');
  }
}
