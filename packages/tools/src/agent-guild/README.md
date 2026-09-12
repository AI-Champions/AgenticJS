# Agent Guild tools

Two optional tools provide evidence about a caller-selected public counterparty.
`AgentGuildPreflight` observes one exact HTTP(S) endpoint.
`AgentGuildVerifyPassport` verifies a supplied public Agent Guild passport with
separately supplied expected issuer and subject DIDs. Neither tool executes the
target, grants permission to delegate, or performs a payment.

These tools use the free Guild operations. They require no Guild account, key or
registration. The fixed service origin is
`https://agent-guild-5d5r.onrender.com`. Guild can log requests and actively probes
the selected endpoint during preflight. The complete passport object is sent to
Guild for verification. `POST /credentials/verify` records a `passport_verified`
event, including unsuccessful verification. Supply public data only: exclude secret
URLs, confidential claims, credentials and unrelated conversation content.

## Use with KaibanJS

After building a checkout containing these tools, both classes are exported from
`@kaibanjs/tools` and `@kaibanjs/tools/agent-guild`. Availability in a published
package depends on the maintainers' release.

```javascript
import { Agent } from 'kaibanjs';
import {
  AgentGuildPreflight,
  AgentGuildVerifyPassport,
} from '@kaibanjs/tools/agent-guild';

const observer = new AgentGuildPreflight();
const passportVerifier = new AgentGuildVerifyPassport({
  maxPassportAgeSeconds: 3600,
});

const researcher = new Agent({
  name: 'Counterparty researcher',
  role: 'Public evidence analyst',
  goal: 'Report measured endpoint evidence and explicit unknowns',
  tools: [observer, passportVerifier],
});
```

The pinned repository resolves different LangChain Core versions in the root and
tools package. A TypeScript consumer assigning these tools to `Agent.tools` has
the same declaration incompatibility as the existing Tavily tool. This example
uses JavaScript; no type cast or dependency-wide change hides that existing limit.

Adding tools is an explicit choice. This does not install a global hook or ensure
the agent invokes them before another action. Model/provider setup is the host's
responsibility; these tools make no model calls themselves.

For a direct operation, supply the endpoint selected for the current task:

```javascript
const observations = JSON.parse(
  await observer.invoke({ url: selectedPublicUrl })
);

const verification = JSON.parse(
  await passportVerifier.invoke({
    credential: suppliedPublicPassport,
    expectedIssuerDid: independentlySelectedIssuerDid,
    expectedSubjectDid: independentlySelectedSubjectDid,
  })
);
```

The expected DIDs must come from an independent caller decision or trusted
context. Copying them from the untrusted credential does not establish that it
belongs to the intended counterparty. Matching DIDs do not bind a person, operator
or endpoint to the credential.

## Inputs and configuration

- Preflight accepts exactly `{ url: string }`. It supports newly selected public
  HTTP(S) DNS endpoints without a mandatory allowlist. IP literals, local/reserved
  host suffixes, user information, fragments, whitespace and malformed URLs are
  rejected. Queries and ports are preserved. Lexical checks do not resolve DNS or
  prove a hostname/path is public; Guild separately screens and probes it.
- Passport verification accepts exactly `credential`, `expectedIssuerDid` and
  `expectedSubjectDid`. The credential must be a JSON object, not a JSON string.
  Its supported format is an `AgentGuildPassport` verifiable credential with
  `DataIntegrityProof` / `eddsa-jcs-2022`, a did:key issuer and subject, and signed
  `validFrom` / `validUntil` UTC timestamps.
- Credential claims are preserved as JSON data, with a 32 KiB encoded limit and
  bounded nesting. Non-JSON values, accessors, cycles, sparse arrays and unsafe
  property keys are rejected before serialization. Expected DIDs and configuration
  are not included in the verification request body.
- `timeoutMs`: 100–45000 ms, default 15000, for waiting on fetch and response-body
  reads. `allowedHosts`: optional exact lowercase DNS host list, captured at
  construction. An empty list disables endpoint observation.
- `expectedIssuerDid`: optional additional operator restriction. Each verification
  still requires both explicit expected DIDs. `maxPassportAgeSeconds`: 1–604800,
  default 86400, measured from signed `validFrom`. Dates, expiry and maximum age
  are checked both before and after the verification request.
- `fetch`: optional host-controlled HTTP dependency override for controlled tests.
  The default is the platform Fetch API. An override must honor `AbortSignal` to
  stop its underlying work: bounded waiting and an abort request cannot physically
  terminate an arbitrary override. No configurable service origin or automatic
  proxy/fallback endpoint is added.

## Results and limits

Ordinary object `invoke` calls return a JSON string. Native invalid-schema input
throws `ToolInputParsingException` before `_call`; direct `_call` also validates
and returns a fixed JSON failure. Native ToolCall envelopes return a ToolMessage
whose `content` contains that JSON. Kaiban uses the native invocation path.

An observation has `status: "observed"`, the exact requested target, local request
and completion times, service origin, HTTP status, decoded response byte count,
all six measured checks, failed checks and unknowns. Check names and statuses must
be complete and unique; summary lists and verdict must agree. Reachability or
handshake failure requires `do_not_delegate`; another failure requires
`delegate_with_caution`; no failure gives `no_failed_checks`, even when some or all
checks are unknown. Unknown never becomes proven. These are service-reported
observations, not guarantees or authorization.

A verification has `status: "completed"`, exact expected DIDs, reported signature
and Guild-issued flags, signed dates and local time/binding results. `verified` is
true only when both reported flags are true and local binding, validity and
freshness checks pass. False flags remain a completed negative verification,
distinct from a network failure. No independent local cryptographic verification
is performed. A signature establishes origin/integrity only, not truthful claims,
safety, task quality, endpoint control or the subject's independent ownership.

Network/deadline/abort failures return `status: "unavailable"`. Invalid evidence,
input or local policy returns `status: "rejected"`. Neither contains a positive
verification. Error codes and limitations are fixed local strings; arbitrary
remote prose, credential claims and extra response fields are not forwarded into
the model-facing result.

The default transport uses standard Fetch in Node 18+ and modern browsers. It
requests `redirect: "error"`, `credentials: "omit"`, no referrer, no cache and no
retries. The 64 KiB response limit applies to bytes delivered by the response
stream after the platform's automatic decoding; it does not bound platform
prefetch buffers or decompression work. The deadline ends waiting and sends an
abort; event-loop suspension can delay timers. Host networking policies still
apply. Platform User-Agent behavior is unchanged and is not an identity proof.

Explicit `invoke(input, { signal })` cancellation is forwarded to fetch. Kaiban's
current agent path does not pass its task cancellation signal, so this tool does
not claim automatic task-cancellation propagation. Browser calls require the
service's CORS permission. Offline tests and Storybook do not establish current
deployed CORS behavior; no proxy or alternate-origin bypass is used.

No `/check`, registration, issuance, billing, collaboration or payment route is
called. Preflight does not associate the observed endpoint with the supplied
passport; these remain two separate evidence operations.

## Development

Follow the tools package's normal root/package installation and build steps.
Run `npm run build` and `npm test -- --runInBand` in `packages/tools`, and the root
contribution checks. The focused tests exercise real built exports, native invoke,
direct `_call`, structured schemas, exact HTTP disclosure, limits and failures.
Only the HTTP boundary is substituted.

The `Tools/Agent Guild` Storybook stories invoke real tools with fixture responses.
Opening or running them makes no HTTP or model call. Passport previews use an
object fixture and report a negative synthetic verifier result. The historical
preflight fixture is first-party, as documented in `fixtures/README.md`; it is not
evidence of independent usage or current availability.
