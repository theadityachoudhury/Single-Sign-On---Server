import z from 'zod';
import { ApplicationType, ClientType } from '@/types/OAuth/OAuthClients.type.js';

export const createOAuthClientSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientDescription: z.string().optional(),
    clientType: z.enum(ClientType).default(ClientType.PUBLIC),
    applicationType: z.enum(ApplicationType).default(ApplicationType.WEB),
    clientURI: z.string().url().optional(),
    logoURI: z.string().url().optional(),
    policyURI: z.string().url().optional(),
    tosURI: z.string().url().optional(),
    accessTokenLifetime: z.number().min(300).default(3600), // min 5 minutes
    refreshTokenLifetime: z.number().min(600).default(1209600), // min 10 minutes
    idTokenLifetime: z.number().min(60).default(120), // min 1 minute
});
