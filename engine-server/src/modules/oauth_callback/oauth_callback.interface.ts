/** Copyright (c) 2022, Poozle, all rights reserved. **/

export interface RedirectURLParams {
  workspaceSlug: string;
  integrationOAuthAppName: string;
  config: string;
}

export interface SessionRecord {
  integrationOAuthAppId: string;
  integrationAccountName: string;
  config: Record<string, string>;
  redirectURL: string;
}

export interface RedirectQueryParams {
  config: string;
  integrationAccountName: string;
  redirectURL: string;
}

export type CallbackParams = Record<string, string>;

export interface ProviderConfig {
  client_id: string;
  client_secret: string;
  scopes: string;
}

const enum ProviderAuthModes {
  'OAuth2' = 'OAuth2',
}

export interface ProviderTemplate {
  auth_mode: ProviderAuthModes;
  authorization_url: string;
  authorization_params?: Record<string, string>;
  scope_separator?: string;
  token_url: string;
  token_params?: Record<string, string>;
  redirect_uri_metadata?: string[];
  token_response_metadata?: string[];
}

export enum OAuthAuthorizationMethod {
  BODY = 'body',
  HEADER = 'header',
}

export enum OAuthBodyFormat {
  FORM = 'form',
  JSON = 'json',
}

export interface ProviderTemplateOAuth2 extends ProviderTemplate {
  auth_mode: ProviderAuthModes.OAuth2;

  disable_pkce?: boolean; // Defaults to false (=PKCE used) if not provided

  token_params?: {
    grant_type?: 'authorization_code' | 'client_credentials';
  };
  authorization_method?: OAuthAuthorizationMethod;
  body_format?: OAuthBodyFormat;

  refresh_url?: string;

  token_request_auth_method?: 'basic';
}
