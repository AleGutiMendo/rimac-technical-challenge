export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} was not found`);
  }
}

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class BusinessRuleException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(message: string) {
    super(message);
  }
}
