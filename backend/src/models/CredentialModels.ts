// Simplified credential interfaces
export interface CreateCredentialData {
  name: string;
  username?: string | null;
  secret: string;
  description?: string | null;
  category?: string | null;
  url?: string | null;
  tags?: string[] | null;
  expirationDate?: Date | null;
  riskLevel?: RiskLevel | null;
}

export interface UpdateCredentialData {
  name?: string;
  username?: string | null;
  secret?: string;
  description?: string | null;
  category?: string | null;
  url?: string | null;
  tags?: string[] | null;
  expirationDate?: Date | null;
  riskLevel?: RiskLevel | null;
}

export interface CredentialFilters {
  search?: string;
  category?: string;
  riskLevel?: string;
  teamId?: string;
  limit?: number;
  offset?: number;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";