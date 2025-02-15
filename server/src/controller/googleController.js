import * as googleService from "../services/googleService.js";

export const login = (req, res) => {
  const url = googleService.generateAuthUrl();
  res.redirect(url);
};

export const callback = async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await googleService.getTokens(code);
    const userInfo = await googleService.getUserInfo(tokens);
    const savedUser = await googleService.saveUser(userInfo, tokens);

    req.session.userId = savedUser.id;

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const me = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const user = await googleService.getUserById(req.session.userId);
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Failed to retrieve user info" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await googleService.getDetailedUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch Google Workspace users" });
  }
};

export const importData = async (req, res) => {
  try {
    const domain = "funai.digital";

    const [users, orgUnits, groups] = await Promise.all([
      googleService.getDetailedUsers(),
      googleService.getOrgUnits(),
      googleService.getGroups(domain),
    ]);

    res.json({ users, orgUnits, groups });
  } catch (error) {
    console.error("Error importing data:", error);
    res
      .status(500)
      .json({ error: "Failed to import data from Google Workspace" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await googleService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
