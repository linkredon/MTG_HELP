"use client";
import { Amplify } from 'aws-amplify';

/**
 * Esta função imprime todas as informações de configuração de autenticação
 * que são relevantes para depurar problemas de login com Google.
 */
export function printAuthDiagnostic() {
  try {
    console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
    let configInfo = 'Configuração não disponível via API pública do Amplify.';
    if (typeof window !== 'undefined' && window.__amplifyConfigured) {
      configInfo = 'Amplify já configurado.';
    }
    console.log('🔍 STATUS AMPLIFY:', configInfo);
    // Não é possível acessar detalhes internos do Auth/Cognito/OAuth
    console.log('ℹ️ Para detalhes, verifique o arquivo de configuração usado em configureAmplify().');
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar diagnóstico de autenticação:', error);
    return false;
  }
}

/**
 * Verifica se a autenticação pode ser bem-sucedida com base na configuração atual
 * @returns Um objeto com o resultado da verificação e possíveis problemas
 */
interface ValidationResult {
  isValid: boolean;
  canProceed: boolean;
  issues: string[];
  warnings: string[];
}

export function validateAuthConfiguration() {
  try {
    const isConfigured = typeof window !== 'undefined' && window.__amplifyConfigured;
    return {
      isValid: isConfigured,
      canProceed: isConfigured,
      issues: isConfigured ? [] : ['Amplify não está configurado.'],
      warnings: []
    };
  } catch (error) {
    return {
      isValid: false,
      canProceed: false,
      issues: [`Erro ao validar configuração: ${error instanceof Error ? error.message : String(error)}`],
      warnings: []
    };
  }
}

/**
 * Retorna um objeto com todos os dados de diagnóstico
 * útil para exibir em um componente de UI
 */
export function getAuthDiagnosticData() {
  try {
    const isConfigured = typeof window !== 'undefined' && window.__amplifyConfigured;
    const validationResult = validateAuthConfiguration();
    return {
      amplifyConfigured: isConfigured,
      validation: validationResult,
      message: isConfigured ? 'Amplify configurado.' : 'Amplify não configurado.'
    };
  } catch (error) {
    console.error('Erro ao obter dados de diagnóstico:', error);
    return {
      error: 'Falha ao obter dados de configuração',
      errorDetails: error instanceof Error ? error.message : String(error)
    };
  }
}

export default { printAuthDiagnostic, getAuthDiagnosticData, validateAuthConfiguration };
