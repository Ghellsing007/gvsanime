import mongoose from "mongoose"

const ForumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a category description"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const ForumTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a topic title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide topic content"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumCategory",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    lastReplyUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastReplyDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const ForumPostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please provide post content"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumTopic",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for post count
ForumTopicSchema.virtual("postCount", {
  ref: "ForumPost",
  localField: "_id",
  foreignField: "topic",
  count: true,
})

// Create text index for search
ForumTopicSchema.index({ title: "text", content: "text", tags: "text" })
ForumPostSchema.index({ content: "text" })

const ForumCategory = mongoose.model("ForumCategory", ForumCategorySchema)
const ForumTopic = mongoose.model("ForumTopic", ForumTopicSchema)
const ForumPost = mongoose.model("ForumPost", ForumPostSchema)

export { ForumCategory, ForumTopic, ForumPost }

