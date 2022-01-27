const Jimp = require("jimp");

async function editedAvatar(filePath) {
  const avatar = await Jimp.read(filePath);
  avatar.resize(250, 250).quality(73).writeAsync(filePath);
}

module.exports = editedAvatar;
