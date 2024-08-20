import { Router } from "express";
import { checkSchema, param } from "express-validator";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodoByID,
  getTodos,
  toggleTodo,
  updateTodo,
} from "../controllers/TodoController";
import { getTodoByIDValidationSchema } from "../schemas/getTodoByIDValidationSchema";
import { createTodoValidationSchema } from "../schemas/createTodoValidationSchema";
import { verifyToken } from "../middlewares/authMiddleware";

const todoRouter = Router();

// Middlewares:
todoRouter.use(verifyToken);

// GET Request:
todoRouter.get("/", getTodos);

// GET By ID Request:
todoRouter.get(
  "/:id",
  checkSchema(getTodoByIDValidationSchema),
  getTodoByID
);

// POST Request:
todoRouter.post(
  "/",
  checkSchema(createTodoValidationSchema),
  createTodo
);

// PUT Request:
todoRouter.put(
  "/:id",
  checkSchema(getTodoByIDValidationSchema),
  updateTodo
);

// PATCH Request:
todoRouter.patch(
  "/:id",
  checkSchema(getTodoByIDValidationSchema),
  toggleTodo
);

// DELETE Request:
todoRouter.delete("/", deleteAllTodos);

todoRouter.delete(
  "/:id",
  checkSchema(getTodoByIDValidationSchema),
  deleteTodo
);

export default todoRouter;
