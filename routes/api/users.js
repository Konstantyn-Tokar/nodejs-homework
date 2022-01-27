const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const { User } = require("../../models");
const { authenticate, upload } = require("../../middlewares");

const editedAvatar = require("../../helpers/avatarEditor");

const router = express.Router();

const avatarDir = path.join(__dirname, "../../", "public", "avatars");

router.get("/logout", authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.get("/current", authenticate, async (req, res) => {
  const { name, email } = req.user;
  res.json({
    user: {
      name,
      email,
    },
  });
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    const { path: tempUpload, filename } = req.file;

    const [extension] = filename.split(".").reverse();

    const newFileName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarDir, newFileName);

    await editedAvatar(tempUpload);
    await fs.rename(tempUpload, fileUpload);
    const avatarURL = path.join("avatars", newFileName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });

    await res.status(200).json({ avatarURL });
  }
);
module.exports = router;
