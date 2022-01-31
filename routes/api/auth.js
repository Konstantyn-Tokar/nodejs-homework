const express = require("express");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");

const { User } = require("../../models");
const { joiRegisterSchema, joiLoginSchema } = require("../../models/user");
const { sendEmail } = require("../../helpers/sendEmail");

const router = express.Router();

const { SECRET_KEY, SITE_NAME } = process.env;

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("User already exist");
    }
    const salt = await bcrypt.genSalt(10);
    const heshPassword = await bcrypt.hash(password, salt);
    const verificationToken = nanoid();
    const avatarURL = gravatar.url(email);
    const newUser = await User.create({
      name,
      email,
      verificationToken,
      password: heshPassword,
      avatarURL,
    });

    const data = {
      to: email,
      subject: "Confirm your email",
      html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`,
    };
    await sendEmail(data);

    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Unauthorized("Email or password is wrong");
    }
    if (!user.verify) {
      throw new Unauthorized("Email not verify");
    }
    const passwordCompaer = await bcrypt.compare(password, user.password);
    if (!passwordCompaer) {
      throw new Unauthorized("Email or password is wrong");
    }
    const { _id, name } = user;
    const payload = {
      id: _id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        name,
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
