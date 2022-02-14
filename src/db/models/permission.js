import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
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

const Permission = mongoose.model('permissions', permissionSchema);

export default Permission;
