import { record, requireValue } from './validation';

const CHECKS = [
  'endpoint_reachable',
  'protocol_handshake',
  'agent_card_resolves',
  'agent_card_signed',
  'payment_claim_holds',
  'independent_evidence',
] as const;

export function observation(value: unknown, target: string) {
  requireValue(record(value) && value.target === target, 'target_mismatch');
  requireValue(
    Array.isArray(value.checks) && value.checks.length === CHECKS.length,
    'incomplete_response'
  );
  const seen = new Map<string, string>();
  for (const item of value.checks) {
    requireValue(
      record(item) &&
        typeof item.check === 'string' &&
        CHECKS.some((key) => key === item.check) &&
        !seen.has(item.check),
      'invalid_response'
    );
    requireValue(
      typeof item.status === 'string' &&
        ['proven', 'failed', 'unknown'].includes(item.status),
      'invalid_response'
    );
    seen.set(item.check, item.status);
  }
  const checks = CHECKS.map((check) => ({
    check,
    status: seen.get(check) as string,
  }));
  const failed = checks
    .filter((check) => check.status === 'failed')
    .map((check) => check.check);
  const unknowns = checks
    .filter((check) => check.status === 'unknown')
    .map((check) => check.check);
  for (const [name, expected] of [
    ['failed', failed],
    ['unknowns', unknowns],
    [
      'scored',
      checks
        .filter((check) => check.status !== 'unknown')
        .map((check) => check.check),
    ],
  ] as const) {
    const received = value[name];
    requireValue(
      Array.isArray(received) &&
        received.length === expected.length &&
        new Set(received).size === expected.length &&
        received.every((item) => expected.includes(item)),
      'inconsistent_response'
    );
  }
  const verdict = failed.some(
    (check) => check === 'endpoint_reachable' || check === 'protocol_handshake'
  )
    ? 'do_not_delegate'
    : failed.length
    ? 'delegate_with_caution'
    : 'no_failed_checks';
  requireValue(value.verdict === verdict, 'inconsistent_response');
  return {
    target,
    verdict,
    checks,
    failed,
    unknowns,
    limitations: [
      'Service-reported observations of this exact URL; later execution is not bound to this result.',
      'Reachability and a protocol handshake do not establish task success or safe data handling.',
      'Card-signature presence is not cryptographic signature verification.',
      'A payment-claim observation is not proof of settlement. Independent ownership remains unverified.',
      'Unknown checks are excluded from the verdict and remain unknown. No permission to delegate or pay is granted.',
    ],
  };
}

export function verification(
  value: unknown,
  credential: Record<string, unknown>,
  issuer: string,
  subject: string
) {
  requireValue(
    record(value) &&
      typeof value.valid === 'boolean' &&
      typeof value.guild_issued === 'boolean',
    'invalid_response'
  );
  requireValue(value.issuer === issuer, 'issuer_mismatch');
  requireValue(value.subject_did === subject, 'subject_mismatch');
  return {
    issuerDid: issuer,
    subjectDid: subject,
    signatureValidReported: value.valid,
    guildIssuedReported: value.guild_issued,
    verified: value.valid && value.guild_issued,
    validFrom: credential.validFrom,
    validUntil: credential.validUntil,
    timeAndBindingChecksPassed: true,
    limitations: [
      'The remote Guild verifier reports signature validity; no independent local cryptographic verification is performed.',
      'A valid signature proves origin and integrity, not truthful claims, safety, task quality or endpoint ownership.',
      'Expected issuer and subject were supplied separately; independence of those choices remains a caller precondition.',
      'No enrollment, issuance, payment or delegation was performed.',
    ],
  };
}
