import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes to obtain basic profile info as well as Directory API access.
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
  'https://www.googleapis.com/auth/admin.directory.group.readonly'
];

export const generateAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

export const getTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const getUserInfo = async (tokens) => {
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  const response = await oauth2.userinfo.get();
  return response.data; // Contains id, email, name, etc.
};

export const saveUser = async (userInfo, tokens) => {
  // Check if the user already exists in the database.
  const existingUser = await prisma.googleUser.findUnique({
    where: { googleId: userInfo.id }
  });

  if (existingUser) {
    // Update token info and profile data if needed.
    return await prisma.googleUser.update({
      where: { googleId: userInfo.id },
      data: {
        email: userInfo.email,
        name: userInfo.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || existingUser.refreshToken,
        tokenType: tokens.token_type,
        scope: tokens.scope,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });
  } else {
    // Create a new user record.
    return await prisma.googleUser.create({
      data: {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
        scope: tokens.scope,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });
  }
};

export const getStoredTokens = async () => {

  return await prisma.googleUser.findFirst();
};

export const getDetailedUsers = async () => {
  const tokenData = await getStoredTokens();
  if (!tokenData) {
    throw new Error('No tokens found. Please authenticate.');
  }
  oauth2Client.setCredentials({
    access_token: tokenData.accessToken,
    refresh_token: tokenData.refreshToken,
  });
// domain-wide delegation  admin account hona chahiye
  oauth2Client.subject = 'amin@email.com'; 

  const admin = google.admin({
    version: 'directory_v1',
    auth: oauth2Client
  });

  const response = await admin.users.list({
    customer: 'my_customer',
    maxResults: 100,
    orderBy: 'email',
    projection: 'full'
  });

  return response.data.users;
};

export const getOrgUnits = async () => {
  const tokenData = await getStoredTokens();
  if (!tokenData) {
    throw new Error('No tokens found. Please authenticate.');
  }
  oauth2Client.setCredentials({
    access_token: tokenData.accessToken,
    refresh_token: tokenData.refreshToken,
  });
  oauth2Client.subject = 'utkarshbirla3@gmail.com'; 

  const admin = google.admin({
    version: 'directory_v1',
    auth: oauth2Client
  });

  const response = await admin.orgunits.list({
    customerId: 'my_customer',
    type: 'all'
  });

  return response.data.organizationUnits;
};

export const getGroups = async (domain) => {
  const tokenData = await getStoredTokens();
  if (!tokenData) {
    throw new Error('No tokens found. Please authenticate.');
  }
  oauth2Client.setCredentials({
    access_token: tokenData.accessToken,
    refresh_token: tokenData.refreshToken,
  });
  oauth2Client.subject = 'amin@email'; 

  const admin = google.admin({
    version: 'directory_v1',
    auth: oauth2Client
  });

  const response = await admin.groups.list({
    domain: domain,
    maxResults: 100
  });

  return response.data.groups;
};

export const getUserById = async (id) => {
  return await prisma.googleUser.findUnique({ where: { id } });
};
