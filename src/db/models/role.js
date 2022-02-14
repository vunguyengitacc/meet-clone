import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

const Role = mongoose.model('roles', roleSchema);

export default Role;
