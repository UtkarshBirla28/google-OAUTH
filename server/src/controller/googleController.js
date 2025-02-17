import * as googleService from "../services/googleService.js";

class GoogleAPIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'GoogleAPIError';
    this.statusCode = statusCode;
  }
}

export const login = (req, res) => {
  try {
    const url = googleService.generateAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Failed to initialize Google login",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const callback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      throw new GoogleAPIError('Authorization code is required', 400);
    }

    const tokens = await googleService.getTokens(code);
    if (!tokens) {
      throw new GoogleAPIError('Failed to obtain access tokens', 401);
    }

    const userInfo = await googleService.getUserInfo(tokens);
    if (!userInfo) {
      throw new GoogleAPIError('Failed to fetch user information', 401);
    }

    const savedUser = await googleService.saveUser(userInfo, tokens);
    req.session.userId = savedUser.id;
    req.session.accessToken = tokens.access_token;

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    const statusCode = error.statusCode || 500;
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed';
    
    res.status(statusCode).json({ 
      error: "Authentication failed",
      message: errorMessage
    });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.session.userId) {
      throw new GoogleAPIError('Not authenticated', 401);
    }

    const user = await googleService.getUserById(req.session.userId);
    if (!user) {
      throw new GoogleAPIError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      error: "Failed to retrieve user info",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (!req.session.userId) {
      throw new GoogleAPIError('Not authenticated', 401);
    }

    const users = await googleService.getDetailedUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      error: "Failed to fetch Google Workspace users",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const importData = async (req, res) => {
  try {
    if (!req.session.userId) {
      throw new GoogleAPIError('Not authenticated', 401);
    }

    const domain = process.env.GOOGLE_WORKSPACE_DOMAIN || "funai.digital";

    const [users, orgUnits, groups] = await Promise.allSettled([
      googleService.getDetailedUsers(),
      googleService.getOrgUnits(),
      googleService.getGroups(domain),
    ]);

    // Handle partial failures
    const result = {
      users: users.status === 'fulfilled' ? users.value : [],
      orgUnits: orgUnits.status === 'fulfilled' ? orgUnits.value : [],
      groups: groups.status === 'fulfilled' ? groups.value : [],
      partialFailure: false
    };

    if (users.status === 'rejected' || orgUnits.status === 'rejected' || groups.status === 'rejected') {
      result.partialFailure = true;
      result.errors = {
        users: users.status === 'rejected' ? users.reason.message : null,
        orgUnits: orgUnits.status === 'rejected' ? orgUnits.reason.message : null,
        groups: groups.status === 'rejected' ? groups.reason.message : null
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Error importing data:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      error: "Failed to import data from Google Workspace",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!req.session.userId) {
      throw new GoogleAPIError('Not authenticated', 401);
    }

    if (!req.params.id) {
      throw new GoogleAPIError('User ID is required', 400);
    }

    const user = await googleService.getUserById(req.params.id);
    if (!user) {
      throw new GoogleAPIError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      error: "Failed to fetch user",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
