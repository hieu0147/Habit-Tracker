import mongoose from "mongoose";

const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: dateKeyRegex,
    },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
    },
  },
  { timestamps: true },
);

habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export type HabitLogDocument = mongoose.InferSchemaType<
  typeof habitLogSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const HabitLogModel =
  mongoose.models.HabitLog ?? mongoose.model("HabitLog", habitLogSchema);
