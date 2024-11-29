import { OAuth2Client } from 'google-auth-library';
import { getEnvVar } from '../utils/env.js';

export const googleClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_CLIENT_ID'),
});