import { Post, User } from "../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});
const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("image"); // 100MB

const postController = {
  async storePost(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }
      const postValidator = Joi.object({
        caption: Joi.string().required(),
        isPostImageNft: Joi.boolean().required(),
      });

      const { error } = postValidator.validate(req.body);
      if (error) {
        if (req.file) {
          // Delete the uploaded file
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }

      let user;
      try {
        user = await User.findOne({ walletAddress: req.params.id });
        if (!user) {
          return next(CustomErrorHandler.notFound());
        }
      } catch (err) {
        return next(err);
      }

      const { caption, isPostImageNft } = req.body;
      let document;
      try {
        document = await Post.create({
          userName: user.name,
          walletAddress: user.walletAddress,
          profileImage: user.profileImage,
          isProfileImageNft: user.isProfileImageNft,
          caption: caption,
          ...(req.file && { imageUrl: filePath }),
          isPostImageNft: isPostImageNft,
          likes: [],
          comments: [],
          reposts: [],
        });
      } catch (err) {
        return next(err);
      }
      res.status(201).json(document);
    });
  },
  async allPost(req, res, next) {
    let documents;
    try {
      documents = await Post.find()
        .select("-updatedAt -__v")
        .sort({ createdAt: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }

    return res.json(documents);
  },
  
  async likePost(req, res, next) {
    const postSchema = Joi.object({
      likes: Joi.array().required(),
    });

    const { error } = postSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { likes } = req.body;
    //Update Likes
    let document;
    try {
      document = await Post.findOneAndUpdate(
        { _id: req.params.postId },
        {
          likes: likes,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    res.status(201).json(document);
  },

  async commentPost(req, res, next) {
    const postSchema = Joi.object({
      comments: Joi.array().required(),
    });

    const { error } = postSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { comments } = req.body;
    //Update Comments
    let document;
    try {
      document = await Post.findOneAndUpdate(
        { _id: req.params.postId },
        {
          comments: comments,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    res.status(201).json(document);
  },

  async repost(req, res, next) {
    const postSchema = Joi.object({
      reposts: Joi.array().required(),
    });

    const { error } = postSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { reposts } = req.body;
    //Update Reposts
    let document;
    try {
      document = await Post.findOneAndUpdate(
        { _id: req.params.postId },
        {
          reposts: reposts,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    res.status(201).json(document);
  },
  
  async deletePost(req, res, next) {
    const document = await Post.findOneAndRemove({ _id: req.params.postId });
    if (!document) {
      return next(new Error("Nothing to delete"));
    }
    //Image Delete
    const imagePath = document._doc.imageUrl;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
    });
    res.json(document);
  },
};
export default postController;
