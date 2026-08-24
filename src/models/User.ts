import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Exclude password from queries by default for safety
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_, ret: Record<string, any>) => {
        delete ret.password;
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save middleware to hash passwords automatically
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Compare input passwords with hashed database passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // If password field is not selected/present (e.g. from select: false),
  // we would need to manually fetch it or verify it is loaded.
  // This method assumes the password field is populated or available.
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
