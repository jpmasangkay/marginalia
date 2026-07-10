import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChecklistItem {
  _id: Types.ObjectId;
  text: string;
  checked: boolean;
}

export interface INote extends Document {
  title: string;
  content: string;
  category: string;
  color: string;
  userId: Types.ObjectId;
  checklist: IChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<IChecklistItem>({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Checklist item text cannot exceed 500 characters'],
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
      default: 'Uncategorized',
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
      validate: {
        validator: (arr: IChecklistItem[]) => arr.length <= 100,
        message: 'Checklist cannot have more than 100 items',
      },
    },
  },
  { timestamps: true }
);

// Index for fast per-user queries
noteSchema.index({ userId: 1, createdAt: -1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
