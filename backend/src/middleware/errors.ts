import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: err.flatten(),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (
    err instanceof mongoose.mongo.MongoServerError &&
    err.code === 11000
  ) {
    res.status(409).json({ message: "Resource already exists" });
    return;
  }

  const status =
    typeof err?.status === "number"
      ? err.status
      : typeof err?.statusCode === "number"
        ? err.statusCode
        : 500;

  const message =
    typeof err?.message === "string" && err.message.length > 0
      ? err.message
      : "Internal server error";

  res.status(status).json({ message });
};

