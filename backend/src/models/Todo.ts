import mongoose, { Schema } from "mongoose";

const TodoSchema = new Schema(
  {
    task: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    completed: {
      type: mongoose.Schema.Types.Boolean,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", TodoSchema);
