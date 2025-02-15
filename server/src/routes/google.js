import express from 'express';
import * as googleController from '../controller/googleController.js';

const router = express.Router();

// Start the Google OAuth flow

router.get('/login', googleController.login);

// OAuth callback – Google redirects here after authentication

router.get('/callback', googleController.callback);

// fetch current logged-in user's info

router.get('/me', googleController.me);

// fetch detailed directory users (if needed separately)

router.get('/users', googleController.getUsers);

//  import all Google Workspace data (users, org units, groups)

router.get('/import', googleController.importData);

export default router;
