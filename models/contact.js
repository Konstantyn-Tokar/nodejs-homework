const { Schema, model } = require("mongoose");
const Joi = require("joi");

const phoneRegexp = "\\(?(\\d{3})\\)?[- ]?(\\d{3})[- ]?(\\d{2})[- ]?(\\d{2})";

const joiSchema = Joi.object({
  name: Joi.string().min(3).max(25).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(new RegExp(phoneRegexp)).required(),
  favorite: Joi.boolean(),
});

const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  joiSchema,
};
