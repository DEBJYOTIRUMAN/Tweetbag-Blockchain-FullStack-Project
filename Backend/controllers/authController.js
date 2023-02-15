import Joi from "joi";
import { User } from "../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});
const handleProfileImageData = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("profileImage"); // 100MB

const handleCoverImageData = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("coverImage"); // 100MB

const authController = {
  async checkIfExists(req, res, next) {
    //Check if the user is already in database
    try {
      const exist = await User.exists({
        walletAddress: req.body.walletAddress,
      });
      if (exist) {
        // Login the user
        try {
          const user = await User.findOne({
            walletAddress: req.body.walletAddress,
          });
          if (!user) {
            return next(CustomErrorHandler.wrongCredentials());
          }
          res.status(201).json(user);
        } catch (err) {
          return next(err);
        }
      } else {
        // Create a new user
        const registerSchema = Joi.object({
          name: Joi.string()
            .pattern(new RegExp("^[a-zA-Z ]{3,30}$"))
            .required(),
          walletAddress: Joi.string().required(),
        });
        const { error } = registerSchema.validate(req.body);

        if (error) {
          return next(error);
        }

        const { name, walletAddress } = req.body;

        //Prepare the model
        let user;
        try {
          user = await User.create({
            name,
            walletAddress,
            profileImage: "uploads/profile.png",
            isProfileImageNft: false,
            coverImage: "uploads/cover.jpg",
            followers: [],
            following: [],
          });
        } catch (err) {
          return next(err);
        }
        res.status(201).json(user);
      }
    } catch (err) {
      return next(err);
    }
  },

  async allUsers(req, res, next) {
    let documents;
    try {
      documents = await User.find().select("-updatedAt -__v");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },

  async updateUserName(req, res, next) {
    const validateSchema = Joi.object({
      name: Joi.string().required(),
    });

    const { error } = validateSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { name } = req.body;
    let document;
    try {
      document = await User.findOneAndUpdate(
        { walletAddress: req.params.id },
        {
          name: name,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    res.status(201).json(document);
  },

  async updateProfilePic(req, res, next) {
    handleProfileImageData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      const filePath = req.file.path;

      const validateSchema = Joi.object({
        isProfileImageNft: Joi.bool().required(),
      });

      const { error } = validateSchema.validate(req.body);

      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        return next(error);
      }

      const { isProfileImageNft } = req.body;

      let document;
      try {
        document = await User.findOneAndUpdate(
          { walletAddress: req.params.id },
          {
            profileImage: filePath,
            isProfileImageNft: isProfileImageNft,
          },
          { new: true }
        );
      } catch (err) {
        return next(err);
      }
      res.status(201).json(document);
    });
  },

  async updateCoverPic(req, res, next) {
    handleCoverImageData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      const filePath = req.file.path;
      let document;
      try {
        document = await User.findOneAndUpdate(
          { walletAddress: req.params.id },
          {
            coverImage: filePath,
          },
          { new: true }
        );
      } catch (err) {
        return next(err);
      }
      res.status(201).json(document);
    });
  },

  async handleFollow(req, res, next) {
    const validateSchema = Joi.object({
      walletAddress: Joi.string().required(),
      followers: Joi.array().required(),
      following: Joi.array().required(),
    });

    const { error } = validateSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { walletAddress, followers, following } = req.body;
    //Update Followers
    let document;
    try {
      document = await User.findOneAndUpdate(
        { walletAddress: req.params.id },
        {
          followers: followers,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    //Update Following
    let document2;
    try {
      document2 = await User.findOneAndUpdate(
        { walletAddress: walletAddress },
        {
          following: following,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    res.status(201).json([document, document2]);
  },

  async getFollowersProfile(req, res, next) {
    const validateSchema = Joi.object({
      followers: Joi.array().required(),
    });

    const { error } = validateSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { followers } = req.body;
    let documents;
    try {
      documents = await User.find({
        walletAddress: { $in: followers },
      }).select("-updatedAt -__v");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },

  async getFollowingProfile(req, res, next) {
    const validateSchema = Joi.object({
      following: Joi.array().required(),
    });

    const { error } = validateSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { following } = req.body;
    let documents;
    try {
      documents = await User.find({
        walletAddress: { $in: following },
      }).select("-updatedAt -__v");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },
  
};

export default authController;
