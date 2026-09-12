import {
  GuildError,
  MAX_BYTES,
  ORIGIN,
  requireValue,
  strictJson,
} from './validation';

export interface AgentGuildOptions {
  /** Fetch/body-read deadline, 100..45000 ms; default 15000. No retries. */
  timeoutMs?: number;
  /** Optional exact lowercase DNS host restrictions; absent permits a newly selected host. */
  allowedHosts?: string[];
  /** Optional additional issuer restriction; invocation still requires both expected DIDs. */
  expectedIssuerDid?: string;
  /** Maximum signed passport age, 1..604800 seconds; default 86400. */
  maxPassportAgeSeconds?: number;
  /** HTTP dependency override for host-controlled testing; default is the platform Fetch API. */
  fetch?: typeof globalThis.fetch;
}

export interface ResponseEvidence {
  value: unknown;
  httpStatus: number;
  responseBytes: number;
  requestedAt: string;
  completedAt: string;
}

export async function requestJson(
  fetcher: typeof globalThis.fetch,
  path: string,
  timeoutMs: number,
  body?: string,
  signal?: AbortSignal
): Promise<ResponseEvidence> {
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timedOut = false;
  const requestedAt = new Date().toISOString();
  const serviceUrl = new URL(`${ORIGIN}${path}`).href;
  const cancel = () => controller.abort();
  const onAbort = () => {
    throw new GuildError(timedOut ? 'request_timeout' : 'request_aborted');
  };
  const aborted = new Promise<never>((_resolve, reject) => {
    controller.signal.addEventListener(
      'abort',
      () => {
        try {
          onAbort();
        } catch (error) {
          reject(error);
        }
      },
      { once: true }
    );
  });
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    if (controller.signal.aborted) return await aborted;
    const work = async (): Promise<ResponseEvidence> => {
      const response = await fetcher(serviceUrl, {
        method: body === undefined ? 'GET' : 'POST',
        headers:
          body === undefined
            ? { Accept: 'application/json' }
            : {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
        body,
        signal: controller.signal,
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        mode: 'cors',
      });
      requireValue(
        !response.redirected && response.status === 200,
        'http_unavailable'
      );
      requireValue(
        response.url === '' || response.url === serviceUrl,
        'unexpected_response_url'
      );
      requireValue(
        response.headers
          .get('content-type')
          ?.split(';')[0]
          .trim()
          .toLowerCase() === 'application/json',
        'invalid_response'
      );
      requireValue(response.body, 'invalid_response');
      reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.byteLength;
        requireValue(size <= MAX_BYTES, 'response_too_large');
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(size);
      let cursor = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, cursor);
        cursor += chunk.byteLength;
      }
      const value = strictJson(
        new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      );
      return {
        value,
        httpStatus: response.status,
        responseBytes: size,
        requestedAt,
        completedAt: new Date().toISOString(),
      };
    };
    return await Promise.race([work(), aborted]);
  } catch (error) {
    if (controller.signal.aborted)
      throw new GuildError(timedOut ? 'request_timeout' : 'request_aborted');
    throw error instanceof GuildError
      ? error
      : new GuildError('request_unavailable');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
    // Cancelling a host-supplied stream must not extend the operation's deadline.
    if (reader) void reader.cancel().catch(() => undefined);
    controller.abort();
  }
}
