import { Request, Response } from "express";
import { Todo } from "../models/Todo";
import { matchedData, validationResult } from "express-validator";
import { RequestWithUser } from "../interfaces/RequestWithUser";
import redisClient from "../utils/redis";

// GET:
const getTodos = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const cacheKey = `todos:${req.user._id}`;

    const cachedTodos = await redisClient.get(cacheKey);

    if (cachedTodos) {
      return res.status(200).send(JSON.parse(cachedTodos));
    }

    const todos = await Todo.find({ userId: req.user?._id });
    if (!todos) {
      return res.status(404).send({ msg: "Not Found" });
    } else {
      await redisClient.set(cacheKey, JSON.stringify(todos), { EX: 60 * 60 });
      return res.status(200).send(todos);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ msg: "Error while fetching data" });
  }
};

// GET By ID:
const getTodoByID = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const foundTodo = await Todo.findOne({ _id: id, userId: req.user?._id });
    if (!foundTodo) {
      return res.status(404).send({ msg: "Not Found" });
    } else {
      return res.send(foundTodo);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ msg: err });
  }
};

// POST:
const createTodo = async (req: RequestWithUser, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array());
  }
  const data = matchedData(req);
  const newTodo = new Todo({
    ...data,
    userId: req.user?._id,
    completed: false,
    createdAt: new Date(),
  });
  try {
    const savedTodo = await newTodo.save();
    const cacheKey = `todos:${req.user?._id}`;

    await redisClient.del(cacheKey);

    return res.status(201).send({ newTodo: savedTodo });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ msg: err });
  }
};

// PUT:
const updateTodo = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ err: result.array() });
    }

    const { body } = req;
    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: id,
        userId: req.user?._id,
      },
      {
        updatedAt: new Date(),
        ...body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    const cacheKey = `todos:${req.user?._id}`;
    await redisClient.del(cacheKey);

    if (!updatedTodo) {
      return res.status(404).send({ err: "Todo not found" });
    } else {
      return res.send(updatedTodo);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: "Error while updating todo" });
  }
};

// PATCH:
const toggleTodo = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).send({ err: result.array() });
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: id,
        userId: req.user?._id,
      },
      { ...req.body },
      { new: true, runValidators: true }
    );

    const cacheKey = `todos:${req.user?._id}`;
    await redisClient.del(cacheKey);

    if (!updatedTodo) {
      return res.status(404).send({ msg: "Not found" });
    } else {
      return res.send(updatedTodo);
    }
  } catch (err) {
    return res.status(500).send({ err: err });
  }
};

// DELETE:
const deleteTodo = async (req: RequestWithUser, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ err: result.array() });
  }
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });

    const cacheKey = `todos:${req.user?._id}`;
    await redisClient.del(cacheKey);

    if (!deletedTodo) {
      return res.status(404).send({ err: "Not Found" });
    } else {
      return res.status(201).send({ msg: "Deleted todo successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ err: "Error while deleting todo" });
  }
};

const deleteAllTodos = async (req: RequestWithUser, res: Response) => {
  try {
    await Todo.deleteMany({ userId: req.user?._id });

    const cacheKey = `todos:${req.user?._id}`;
    await redisClient.del(cacheKey);

    res.status(200).json({ message: "All todos deleted" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export {
  getTodos,
  getTodoByID,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  deleteAllTodos,
};
