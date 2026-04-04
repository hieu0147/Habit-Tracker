import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { UserModel, type UserDocument } from "../models/User";
import { HttpError } from "../lib/httpError";
import { requireAuth } from "../middleware/auth";

const updateStatusSchema = z.object({
  status: z.enum(["active", "blocked"]),
});

function toPublicUser(doc: UserDocument) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Middleware to check if user is admin
const requireAdmin: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.userId) {
      next(new HttpError(401, "User ID not found"));
      return;
    }
    
    const user = await UserModel.findById(req.userId);
    if (!user) {
      next(new HttpError(404, "User not found"));
      return;
    }
    
    if (user.role !== "admin") {
      next(new HttpError(403, "Admin access required"));
      return;
    }
    
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    next(new HttpError(500, "Internal server error"));
  }
};

export const adminRouter = Router();

// Apply authentication and admin check to all routes
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/users - Get all users
adminRouter.get("/users", async (_req, res, next) => {
  try {
    console.log("Admin requesting all users");
    const users = await UserModel.find().sort({ createdAt: -1 });
    const publicUsers = users.map(toPublicUser);
    console.log(`Found ${users.length} users`);
    res.json({ users: publicUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new HttpError(500, "Failed to fetch users"));
  }
});

// PUT /api/admin/users/:id/status - Update user status
adminRouter.put("/users/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    console.log(`Admin updating user ${id} status to ${status}`);

    // Prevent user from changing their own status
    if (id === req.userId) {
      console.log("User attempted to change their own status");
      next(new HttpError(400, "Cannot change your own status"));
      return;
    }

    const user = await UserModel.findById(id);
    if (!user) {
      console.log(`User ${id} not found`);
      next(new HttpError(404, "User not found"));
      return;
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    console.log(`Updated user ${id} status from ${oldStatus} to ${status}`);
    res.json(toPublicUser(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Invalid status value:", error.issues);
      next(new HttpError(400, "Invalid status value"));
      return;
    }
    console.error("Error updating user status:", error);
    next(new HttpError(500, "Failed to update user status"));
  }
});
