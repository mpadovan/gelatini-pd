import mongoose, { Mongoose } from "mongoose";
const schema = new mongoose.Schema(
  {
    name: {
        type: "string",
        unique: true
    },
    price: {
        type: "string"
    },
    totalSlots: {
      type: "number",
      required: true,
    },
    reservedSlots: {
      type: "number",
      default: 0,
    },
    pricePerSlot: {
      type: "number",
    }
  },
  { timestamps: true, strict: true, strictQuery: true }
);
export default mongoose.model("User", schema, "slots");
