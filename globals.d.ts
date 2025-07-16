/* globals.d.ts */
// Declarações para regras CSS do Tailwind
declare namespace TailwindCSS {
  export interface TailwindConfig {
    prefix?: string;
    important?: boolean;
    separator?: string;
    theme?: Record<string, any>;
    variants?: Record<string, any>;
    plugins?: Array<any>;
    purge?: Array<string>;
  }
}

// Suporte para @tailwind, @apply e outras diretivas do Tailwind no CSS
declare module '*.css' {
  const content: string;
  export default content;
}

// Declarações para os avisos de CSS no arquivo globals.css
interface CSSRules {
  '@tailwind': string;
  '@apply': string;
}
