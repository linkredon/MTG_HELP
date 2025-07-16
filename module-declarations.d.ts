// Define declarações para todos os módulos personalizados usando o prefixo @/
declare module '@/lib/auth' {
  export const authOptions: any;
  export function registerUser(userData: { name: string, email: string, password: string }): Promise<{ 
    success: boolean; 
    message?: string; 
    user?: any;
  }>;
  export function getUserById(id: string): Promise<{
    success: boolean;
    message?: string;
    user?: any;
  }>;
}

declare module '@/lib/fallbackAuth' {
  export const fallbackAuthOptions: any;
}

declare module '@/lib/auth-helpers' {
  export function signIn(email: string, password: string): Promise<any>;
  export function signUp(email: string, password: string, name?: string, isAdmin?: boolean): Promise<any>;
}

declare module '@/lib/authDiagnostic' {
  export function printAuthDiagnostic(): void;
  export function validateAuthConfiguration(): any;
  export function getAuthDiagnosticData(): any;
}

declare module '@/lib/awsConfig' {
  export const dynamoDb: any;
  export const TABLES: Record<string, string>;
  export default function getAwsConfig(): any;
}

declare module '@/components/AuthDiagnostic' {
  export default function AuthDiagnostic(props: any): JSX.Element;
}

declare module '@/components/AuthDebugger' {
  export default function AuthDebugger(props: any): JSX.Element;
}

declare module '@/components/AuthTroubleshooter' {
  export default function AuthTroubleshooter(props: any): JSX.Element;
}

declare module '@/components/ui/tabs' {
  export const Tabs: any;
  export const TabsList: any;
  export const TabsTrigger: any;
  export const TabsContent: any;
}

// Adicionando declarações para contextos
declare module '@/contexts/AuthContext' {
  export interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<any>;
    googleSignIn: () => Promise<any>;
    register: (email: string, password: string, name?: string) => Promise<any>;
    confirmSignUp: (email: string, code: string) => Promise<any>;
  }
  
  export const AuthContext: React.Context<AuthContextType>;
  export function useAuth(): AuthContextType;
  export default function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
}

// Declarações para componentes de UI
declare module '@/components/UserInfo' {
  export default function UserInfo(props: any): JSX.Element;
}

declare module '@/components/LoginForm' {
  export default function LoginForm(props: any): JSX.Element;
}

// Novas declarações para resolver os erros pendentes

// Componentes de página
declare module '@/components/Painel-compact' {
  export default function Painel(props: { onNavigate: (tab: string) => void }): JSX.Element;
}

declare module '@/components/ConstrutorDecks-compact' {
  export default function ConstrutorDecks(props: any): JSX.Element;
}

declare module '@/components/Regras-compact' {
  export default function Regras(props: any): JSX.Element;
}

declare module '@/components/Spoiler-compact' {
  export default function Spoiler(props: any): JSX.Element;
}

declare module '@/components/Favoritos-compact' {
  export default function Favoritos(props: any): JSX.Element;
}

declare module '@/components/UserHeader' {
  export default function UserHeader(props?: { user?: any }): JSX.Element;
}

declare module '@/components/MobileNavigation' {
  export default function MobileNavigation(props: { 
    activeTab: string;
    setActiveTab?: (tab: string) => void;
    onTabChange?: React.Dispatch<React.SetStateAction<string>>;
    tabs?: Array<any>;
  }): JSX.Element;
}

declare module '@/contexts/AppContext' {
  import type { MTGCard, UserCollection, CollectionCard, Deck, DeckCard } from '@/types/mtg';
  
  export interface AppContextType {
    collections: UserCollection[];
    currentCollection: UserCollection | undefined;
    setCurrentCollection: React.Dispatch<React.SetStateAction<UserCollection[]>>;
    currentCollectionId: string | null;
    setCurrentCollectionId: (id: string | null) => void;
    createCollection: (name: string, description?: string) => Promise<string>;
    updateCollection: (id: string, updates: Partial<UserCollection>) => Promise<void>;
    deleteCollection: (id: string) => Promise<void>;
    duplicateCollection: (id: string) => Promise<void>;
    adicionarCarta: (card: MTGCard, quantidade?: number) => Promise<void>;
    removerCarta: (card: MTGCard) => Promise<void>;
    getQuantidadeNaColecao: (cardId: string) => number;
    
    // Gerenciamento de Decks
    decks: Deck[];
    setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
    criarDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>) => Promise<string>;
    editarDeck: (deckId: string, updates: Partial<Deck>) => Promise<void>;
    deletarDeck: (deckId: string) => Promise<void>;
    duplicarDeck: (deckId: string, newName?: string) => Promise<string | undefined>;
    adicionarCartaAoDeck: (deckId: string, card: MTGCard, category?: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => Promise<void>;
    removerCartaDoDeck: (deckId: string, cardId: string, category?: 'mainboard' | 'sideboard' | 'commander') => Promise<void>;
    atualizarQuantidadeNoDeck: (deckId: string, cardId: string, novaQuantidade: number, category?: 'mainboard' | 'sideboard' | 'commander') => Promise<void>;
    getCartasUsadasEmDecks: (cardId: string) => Array<{deck: Deck, quantity: number, category: string}>;
    importarDeckDeLista: (deckList: string, deckData: any) => Promise<string>;
    
    // Favoritos
    favorites: MTGCard[];
    addFavorite: (card: MTGCard) => Promise<void>;
    removeFavorite: (cardId: string) => Promise<void>;
    isFavorite: (cardId: string) => boolean;
    
    // Estado de carregamento
    loading: boolean;
    
    // Exportação
    exportCollectionToCSV: (collection: UserCollection) => void;
  }
  
  export const AppContext: React.Context<AppContextType | null>;
  export function useAppContext(): AppContextType;
  export const AppProvider: React.FC<{children: React.ReactNode}>;
}
