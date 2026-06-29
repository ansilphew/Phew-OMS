const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      userName: user.userName,
      role: user.role,
      clientName: user.clientName || "",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function setTokenCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("oms_token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function getRoleRoute(role) {
  const roleRoutes = {
    CEO: "/ceo",
    BDE: "/ceo/lead-management",
    Accountant: "/ceo/proposal-management",
    "Project Manager": "/project-manager",
    Client: "/client",
    "Sales Head": "/ceo/lead-management",
  };

  return roleRoutes[role] || "/";
}

async function registerUser(req, res) {
  try {
    const requesterToken = req.cookies.oms_token;
    if (!requesterToken) {
      return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    let decodedRequester;
    try {
      decodedRequester = jwt.verify(requesterToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired session token." });
    }

    if (decodedRequester.role !== "CEO" && decodedRequester.role !== "Project Manager") {
      return res.status(403).json({ message: "Access denied. Only CEO or Project Managers can register new users." });
    }

    const { fullName, userName, password, role, clientName } = req.body;

    if (!fullName || !userName || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      userName,
      password: hashedPassword,
      role,
      clientName: role === "Client" ? (clientName || "") : "",
    });

    // Do NOT set token cookie here, because the register action is performed by PM/CEO
    // who wants to remain logged in as themselves!

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        role: user.role,
        clientName: user.clientName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = createToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        role: user.role,
      },
      redirectTo: getRoleRoute(user.role),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
      redirectTo: getRoleRoute(user.role),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateUserProfile(req, res) {
  try {
    const {
      fullName,
      location,
      email,
      phone,
      company,
      jobTitle,
      department,
      designation,
      website,
      avatarUrl,
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    user.location = location !== undefined ? location : user.location;
    user.email = email !== undefined ? email : user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.company = company !== undefined ? company : user.company;
    user.jobTitle = jobTitle !== undefined ? jobTitle : user.jobTitle;
    user.department = department !== undefined ? department : user.department;
    user.designation = designation !== undefined ? designation : user.designation;
    user.website = website !== undefined ? website : user.website;
    
    if (avatarUrl !== undefined) {
      if (avatarUrl) {
        const { uploadImage } = require("../utils/cloudinary");
        user.avatarUrl = await uploadImage(avatarUrl, "avatars");
      } else {
        user.avatarUrl = "";
      }
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

function logoutUser(req, res) {
  res.clearCookie("oms_token");
  return res.status(200).json({ message: "Logout successful" });
}

async function getLeadProjects(req, res) {
  try {
    const Lead = require("../models/Lead");
    const leads = await Lead.find({}, "projectName organization").sort({ projectName: 1 });
    return res.status(200).json({ leads });
  } catch (error) {
    console.error("getLeadProjects error:", error);
    return res.status(500).json({ message: "Server error fetching lead projects" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  getLeadProjects,
};
