export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class InvalidInputError extends Error {
  constructor(public fieldErrors: Record<string, string[]>) {
    super("Invalid input");
    this.name = "InvalidInputError";
  }
}
