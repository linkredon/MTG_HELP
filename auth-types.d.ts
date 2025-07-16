// Interfaces para validação de autenticação
interface ValidationResult {
  isValid: boolean;
  canProceed: boolean;
  issues: string[];
  warnings: string[];
}

// Interface para dados de diagnóstico
interface DiagnosticData {
  userPoolId: string;
  clientId: string;
  domain: string;
  providers: string[];
  redirectSignIn: string[];
  redirectSignOut: string[];
  currentOrigin: string;
  hasMatchingRedirect: boolean;
  validation: ValidationResult;
  domainHasHttps: boolean;
  cookiesEnabled: boolean;
  error?: string;
  errorDetails?: string;
}

// Declaração de tipo para o arquivo authDiagnostic.ts
declare module '@/lib/authDiagnostic' {
  export function printAuthDiagnostic(): boolean;
  
  export function validateAuthConfiguration(): ValidationResult;
  
  export function getAuthDiagnosticData(): DiagnosticData | {
    error: string;
    errorDetails: string;
  };
  
  export default {
    printAuthDiagnostic, 
    validateAuthConfiguration, 
    getAuthDiagnosticData
  };
}
