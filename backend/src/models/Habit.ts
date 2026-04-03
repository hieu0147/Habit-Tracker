import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    startDate: { type: Date, default: () => new Date() },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: "" },
    targetPerDay: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

export type HabitDocument = mongoose.InferSchemaType<typeof habitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const HabitModel =
  mongoose.models.Habit ?? mongoose.model("Habit", habitSchema);

