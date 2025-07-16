declare module 'aws-amplify' {
  export class Amplify {
    static configure(config: any): void;
    static getConfig(): any;
  }
  
  export const Auth: any;
  export const API: any;
  export const Storage: any;
}

declare module 'aws-amplify/auth' {
  export const fetchAuthSession: any;
  export const getCurrentUser: any;
  export const signIn: any;
  export const signUp: any;
  export const confirmSignUp: any;
  export const signOut: any;
}

declare module 'aws-amplify/auth/cognito' {
  export const cognitoUserPoolsTokenProvider: any;
}

declare module 'aws-amplify/api' {
  export const generateClient: any;
}

declare module 'aws-amplify/utils' {
  export const Hub: any;
}

declare module '@aws-sdk/client-dynamodb' {
  export class DynamoDBClient {
    constructor(config: any);
  }
}

declare module '@aws-sdk/lib-dynamodb' {
  export const DynamoDBDocumentClient: {
    from(client: any): any;
  };
  
  export class PutCommand {
    constructor(params: any);
  }
  
  export class GetCommand {
    constructor(params: any);
  }
  
  export class QueryCommand {
    constructor(params: any);
  }
}
