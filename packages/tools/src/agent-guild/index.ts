import { StructuredTool } from '@langchain/core/tools';
import type { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import type { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';
import { observation, verification } from './projection';
import { AgentGuildOptions, requestJson } from './transport';
import {
  credentialObject,
  credentialSchema,
  didSchema,
  endpoint,
  GuildError,
  ORIGIN,
  passportBinding,
  requireValue,
} from './validation';

export type { AgentGuildOptions } from './transport';

const endpointSchema = z
  .object({
    url: z
      .string()
      .min(1)
      .max(2048)
      .describe(
        'Exact selected public HTTP(S) endpoint. Sent to Guild for active probing; exclude secrets and private data.'
      ),
  })
  .strict();
const passportSchema = z
  .object({
    credential: credentialSchema.describe(
      'Unchanged supplied PUBLIC Agent Guild passport object; never confidential claims.'
    ),
    expectedIssuerDid: didSchema.describe(
      'Expected issuer did:key independently selected by the caller, not copied from this credential.'
    ),
    expectedSubjectDid: didSchema.describe(
      'Expected subject did:key independently selected by the caller, not copied from this credential.'
    ),
  })
  .strict();

function configure(options: AgentGuildOptions) {
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxAge = options.maxPassportAgeSeconds ?? 86400;
  requireValue(
    Number.isInteger(timeoutMs) && timeoutMs >= 100 && timeoutMs <= 45000,
    'invalid_config'
  );
  requireValue(
    Number.isInteger(maxAge) && maxAge >= 1 && maxAge <= 604800,
    'invalid_config'
  );
  const hosts = options.allowedHosts;
  requireValue(
    hosts === undefined ||
      (Array.isArray(hosts) &&
        hosts.length <= 64 &&
        hosts.every(
          (host) =>
            typeof host === 'string' && endpoint(`https://${host}/`) === host
        )),
    'invalid_config'
  );
  const issuer =
    options.expectedIssuerDid === undefined
      ? undefined
      : didSchema.parse(options.expectedIssuerDid);
  const fetcher = options.fetch ?? globalThis.fetch?.bind(globalThis);
  requireValue(typeof fetcher === 'function', 'fetch_unavailable');
  return {
    timeoutMs,
    maxAge,
    hosts: hosts === undefined ? undefined : new Set(hosts),
    issuer,
    fetcher,
  };
}

function failure(operation: string, error: unknown): string {
  const code =
    error instanceof GuildError
      ? error.code
      : error instanceof z.ZodError
      ? 'invalid_input'
      : 'operation_unavailable';
  const transport = [
    'http_unavailable',
    'request_unavailable',
    'request_aborted',
    'request_timeout',
  ].includes(code);
  return JSON.stringify({
    operation,
    status: transport ? 'unavailable' : 'rejected',
    code,
    verified: false,
    serviceOrigin: ORIGIN,
  });
}

/** Optional observation operation. It is not a hook or authorization decision. */
export class AgentGuildPreflight extends StructuredTool<typeof endpointSchema> {
  name = 'agent_guild_preflight';
  description =
    'Observe one selected public endpoint through Agent Guild. Active probe; returns measured statuses and unknowns, never authorization to delegate or pay.';
  schema = endpointSchema;
  private readonly settings: ReturnType<typeof configure>;

  constructor(options: AgentGuildOptions = {}) {
    super();
    this.settings = configure(options);
  }

  async _call(
    input: z.input<typeof endpointSchema>,
    _manager?: CallbackManagerForToolRun,
    config?: RunnableConfig
  ): Promise<string> {
    try {
      const { url } = endpointSchema.parse(input);
      const host = endpoint(url);
      requireValue(
        this.settings.hosts === undefined || this.settings.hosts.has(host),
        'host_not_approved'
      );
      const response = await requestJson(
        this.settings.fetcher,
        `/preflight?url=${encodeURIComponent(url)}`,
        this.settings.timeoutMs,
        undefined,
        config?.signal
      );
      return JSON.stringify({
        operation: 'endpoint_observation',
        status: 'observed',
        serviceOrigin: ORIGIN,
        requestedAt: response.requestedAt,
        completedAt: response.completedAt,
        httpStatus: response.httpStatus,
        responseBytes: response.responseBytes,
        ...observation(response.value, url),
      });
    } catch (error) {
      return failure('endpoint_observation', error);
    }
  }
}

/** Verifies only a supplied public passport, with independently chosen expectations. */
export class AgentGuildVerifyPassport extends StructuredTool<
  typeof passportSchema
> {
  name = 'agent_guild_verify_passport';
  description =
    'Verify a supplied public Guild passport with independently selected expected issuer and subject DIDs. Origin/integrity only; no endpoint binding, issuance, registration or authorization.';
  schema = passportSchema;
  private readonly settings: ReturnType<typeof configure>;

  constructor(options: AgentGuildOptions = {}) {
    super();
    this.settings = configure(options);
  }

  async _call(
    input: z.input<typeof passportSchema>,
    _manager?: CallbackManagerForToolRun,
    config?: RunnableConfig
  ): Promise<string> {
    try {
      const parsed = passportSchema.parse(input);
      const credential = credentialObject(parsed.credential);
      const { expectedIssuerDid: issuer, expectedSubjectDid: subject } = parsed;
      requireValue(
        this.settings.issuer === undefined || this.settings.issuer === issuer,
        'issuer_not_approved'
      );
      passportBinding(
        credential,
        issuer,
        subject,
        this.settings.maxAge,
        Date.now()
      );
      const response = await requestJson(
        this.settings.fetcher,
        '/credentials/verify',
        this.settings.timeoutMs,
        JSON.stringify(credential),
        config?.signal
      );
      passportBinding(
        credential,
        issuer,
        subject,
        this.settings.maxAge,
        Date.now()
      );
      return JSON.stringify({
        operation: 'passport_verification',
        status: 'completed',
        serviceOrigin: ORIGIN,
        requestedAt: response.requestedAt,
        completedAt: response.completedAt,
        httpStatus: response.httpStatus,
        responseBytes: response.responseBytes,
        ...verification(response.value, credential, issuer, subject),
      });
    } catch (error) {
      return failure('passport_verification', error);
    }
  }
}
