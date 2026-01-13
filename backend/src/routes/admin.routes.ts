import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createSanctionManager,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

/**
 * 🔒 ADMIN ONLY
 */
router.use(authMiddleware, roleMiddleware([Role.ADMIN]));

/**
 * GET /admin/users
 */
router.get("/users", getAllUsers);

/**
 * GET /admin/users/:id
 */
router.get("/users/:id", getUserById);

/**
 * POST /admin/sanction-managers
 * Admin creates Sanction Manager login
 */
router.post("/sanction-managers", createSanctionManager);

export default router;
