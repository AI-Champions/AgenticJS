import React, { useState } from 'react';
import { AgentGuildPreflight, AgentGuildVerifyPassport } from './index';
import preflightRaw from './fixtures/preflight.raw?raw';
const preflight = JSON.parse(preflightRaw);

// Only the HTTP boundary is substituted. These are synthetic display results,
// not a live observation, cryptographic verification, or independently owned agent.
const issuer = `did:key:z${'A'.repeat(44)}`;
const subject = `did:key:z${'B'.repeat(44)}`;
function FixturePreview({ passport = false }) {
  const [output, setOutput] = useState(
    'Select Run offline fixture. No network or model is used.'
  );
  const run = async () => {
    try {
      let tool;
      let params;
      if (passport) {
        tool = new AgentGuildVerifyPassport({
          fetch: async () =>
            new Response(
              JSON.stringify({
                valid: false,
                guild_issued: false,
                issuer,
                subject_did: subject,
              }),
              { headers: { 'Content-Type': 'application/json' } }
            ),
        });
        params = {
          expectedIssuerDid: issuer,
          expectedSubjectDid: subject,
          credential: {
            '@context': ['https://www.w3.org/ns/credentials/v2'],
            type: ['VerifiableCredential', 'AgentGuildPassport'],
            issuer,
            validFrom: new Date(Date.now() - 60000).toISOString(),
            validUntil: new Date(Date.now() + 60000).toISOString(),
            credentialSubject: {
              id: subject,
              demo: 'Synthetic public fixture, not a signed identity.',
            },
            proof: {
              type: 'DataIntegrityProof',
              cryptosuite: 'eddsa-jcs-2022',
              proofPurpose: 'assertionMethod',
              verificationMethod: `${issuer}#${issuer.slice(8)}`,
              proofValue: 'zABCDEF',
            },
          },
        };
      } else {
        tool = new AgentGuildPreflight({
          fetch: async () =>
            new Response(JSON.stringify(preflight), {
              headers: { 'Content-Type': 'application/json' },
            }),
        });
        params = { url: preflight.target };
      }
      setOutput(JSON.stringify(JSON.parse(await tool.invoke(params)), null, 2));
    } catch {
      setOutput(
        'Offline fixture could not be rendered. No verification is established.'
      );
    }
  };
  return (
    <section style={{ maxWidth: 800 }}>
      <p>
        Optional Agent Guild{' '}
        {passport ? 'public-passport verification' : 'endpoint observation'} —
        offline fixture only.
      </p>
      <button onClick={run}>Run offline fixture</button>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{output}</pre>
    </section>
  );
}

export default {
  title: 'Tools/Agent Guild',
  component: FixturePreview,
  tags: ['autodocs'],
};
export const EndpointObservation = { args: { passport: false } };
export const PublicPassport = { args: { passport: true } };
