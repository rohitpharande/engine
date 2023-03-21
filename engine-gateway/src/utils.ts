/** Copyright (c) 2023, Poozle, all rights reserved. **/
import { fetch } from '@whatwg-node/fetch';
import { createClient } from 'redis';

function getRedisClient() {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
    });

    return client;
  } catch (e) {
    console.log(e);

    return undefined;
  }
}

function getConfigJSON(config64: string) {
  try {
    if (config64) {
      const buff = new Buffer(config64, 'base64');
      let config = buff.toString('utf8');
      config = JSON.parse(config);

      // This to check if the base64 is still not parsed to JSON
      if (typeof config === 'string') {
        config = JSON.parse(config);
      }

      return config;
    }

    return {};
  } catch (e) {
    return {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToString(config: Record<string, any>) {
  return Buffer.from(JSON.stringify(config)).toString('base64');
}

async function saveToRedis(key: string, value: string, expiresIn: number) {
  const client = getRedisClient();
  if (client) {
    try {
      await client.connect();
      const setValue = await client.set(
        `${process.env.WORKSPACE_ID}__${key}`,
        value,
        {
          EX: expiresIn,
        },
      );
      await client.quit();
      return setValue;
    } catch (e) {
      console.log(e);

      return undefined;
    }
  }

  return undefined;
}

async function getFromRedis(key: string) {
  const client = getRedisClient();
  if (client) {
    try {
      await client.connect();
      const value = await client.get(key);
      await client.quit();
      return value;
    } catch (e) {
      console.log(e);

      return undefined;
    }
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAuthHeades(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
) {
  try {
    const headers = options.headers;

    /**
     * These values will only passed once mesh is build and we running queries through mesh
     */
    if (headers.config && headers.name) {
      const redisValue = await getFromRedis(headers.name);
      /**
       * If the redis has the key return the key without fetching it again
       */
      if (redisValue) {
        return { authHeaders: redisValue, ...headers };
      }

      const document = `
        query GetHeaders($config: CredentialsT0!) {
          getHeaders(config: $config) {
            headers
          }
        }
      `;
      const config = getConfigJSON(headers.config);

      const variables = {
        config,
      };

      const result = await fetch(url, {
        ...options,
        body: JSON.stringify({
          query: document,
          variables,
        }),
      });
      const jsonBody = await result.json();
      const parsedHeaders = jsonBody.data.getHeaders.headers;
      const finalHeaders = {
        ...headers,
        authHeaders: convertToString(parsedHeaders),
      };

      await saveToRedis(
        headers.name,
        convertToString(parsedHeaders),
        headers.redisExpiry || 60,
      );

      return finalHeaders;
    }
  } catch (e) {
    console.log(e);
    return {};
  }

  return {};
}
