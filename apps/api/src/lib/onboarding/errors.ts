export class AgencyEmailConflictError extends Error {
  readonly code = "AGENCY_EMAIL_CONFLICT";
  readonly status = 409;

  constructor(message = "Email belongs to an agency account") {
    super(message);
    this.name = "AgencyEmailConflictError";
  }
}
