// Classes personalizadas para substituir os comandos ausentes

// UpdateCommand para atualizar items no DynamoDB
export class UpdateCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}

// DeleteCommand para deletar items do DynamoDB
export class DeleteCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}

// ScanCommand para escanear items no DynamoDB
export class ScanCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}
