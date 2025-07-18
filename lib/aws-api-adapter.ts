'use client';

/**
 * Adaptador para compatibilidade entre versões do AWS Amplify API
 * Este arquivo fornece uma camada de compatibilidade para APIs do AWS Amplify
 */
import { get, post, put, del } from 'aws-amplify/api';

export { get, post, put, del };
