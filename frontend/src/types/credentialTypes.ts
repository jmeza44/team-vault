import { RiskLevel } from '@/types';

export interface CredentialFormData {
  name: string;
  username: string;
  secret: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
  expirationDate: string;
  riskLevel: RiskLevel;
}

export interface ShareData {
  shares: Array<{
    id: string;
    accessLevel: 'READ' | 'WRITE';
    expiresAt?: string;
    sharedWithUser?: {
      id: string;
      name: string;
      email: string;
    };
    sharedWithTeam?: {
      id: string;
      name: string;
      description?: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
}

export interface CreateCredentialRequest {
  name: string;
  username?: string;
  secret: string;
  description?: string;
  category?: string;
  url?: string;
  tags?: string[];
  expirationDate?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UpdateCredentialRequest
  extends Partial<CreateCredentialRequest> {}

export interface GetCredentialsParams {
  category?: string;
  search?: string;
  teamId?: string;
  limit?: number;
  offset?: number;
}

export interface ShareCredentialRequest {
  userIds?: string[];
  teamIds?: string[];
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}

export interface CreateOneTimeLinkRequest {
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}