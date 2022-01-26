const express = require("express");
const { NotFound, BadRequest } = require("http-errors");

const { authenticate } = require("../../middlewares");
const { joiSchema } = require("../../models/contact");
const { Contact } = require("../../models");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const { _id } = req.user;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt",
      { skip, limit: +limit }
    );
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new NotFound();
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updateContact) {
      throw new NotFound();
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:id/favorite", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    const updateContact = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      { new: true }
    );
    if (!updateContact) {
      throw new NotFound();
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(id);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json({ message: "Contact delete" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
