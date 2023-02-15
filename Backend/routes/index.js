import express from "express";
const router = express.Router();
import {
  authController,
  newsController,
  postController,
} from "../controllers";
import admin from '../middlewares/admin';

// Auth Routes
router.post("/user", authController.checkIfExists);
router.get("/user", authController.allUsers);
router.put("/user/:id", authController.updateUserName);
router.put("/user/image/:id", authController.updateProfilePic);
router.put("/user/cover/:id", authController.updateCoverPic);
router.put("/user/follow/:id", authController.handleFollow);
router.post("/user/followers", authController.getFollowersProfile);
router.post("/user/following", authController.getFollowingProfile);

// Post Routes
router.post("/post/:id", postController.storePost);
router.get("/post", postController.allPost);
router.put("/post/like/:postId", postController.likePost);
router.put("/post/comment/:postId", postController.commentPost);
router.put("/post/repost/:postId", postController.repost);
router.delete("/post/:postId", postController.deletePost);

// News Routes
router.post("/news/:id", admin, newsController.storeNews);
router.get("/news", newsController.allNews);
router.put("/news/like/:newsId", newsController.likeNews);
router.delete("/news/:newsId", newsController.deleteNews);

export default router;
