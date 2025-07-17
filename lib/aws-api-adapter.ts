'use client';

/**
 * Adaptador para compatibilidade entre versões do AWS Amplify API
 * Este arquivo fornece uma camada de compatibilidade para APIs do AWS Amplify
 */
import { API } from 'aws-amplify';

// Re-exportamos as funções com a mesma assinatura da versão 6
export const post = async (options: {
  apiName: string;
  path: string;
  options?: {
    headers?: Record<string, string>;
    body?: any;
    queryParams?: Record<string, string>;
  };
}) => {
  try {
    return await API.post(options.apiName, options.path, {
      headers: options.options?.headers || {},
      body: options.options?.body,
      queryStringParameters: options.options?.queryParams,
    });
  } catch (error) {
    console.error('Erro na chamada de API post:', error);
    throw error;
  }
};

export const get = async (options: {
  apiName: string;
  path: string;
  options?: {
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
  };
}) => {
  try {
    return await API.get(options.apiName, options.path, {
      headers: options.options?.headers || {},
      queryStringParameters: options.options?.queryParams,
    });
  } catch (error) {
    console.error('Erro na chamada de API get:', error);
    throw error;
  }
};

export const put = async (options: {
  apiName: string;
  path: string;
  options?: {
    headers?: Record<string, string>;
    body?: any;
    queryParams?: Record<string, string>;
  };
}) => {
  try {
    return await API.put(options.apiName, options.path, {
      headers: options.options?.headers || {},
      body: options.options?.body,
      queryStringParameters: options.options?.queryParams,
    });
  } catch (error) {
    console.error('Erro na chamada de API put:', error);
    throw error;
  }
};

export const del = async (options: {
  apiName: string;
  path: string;
  options?: {
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
  };
}) => {
  try {
    return await API.del(options.apiName, options.path, {
      headers: options.options?.headers || {},
      queryStringParameters: options.options?.queryParams,
    });
  } catch (error) {
    console.error('Erro na chamada de API del:', error);
    throw error;
  }
};
