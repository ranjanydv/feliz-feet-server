function joiErrorParser(error) {
  return {
    field: error.path[0],
    message: error.message.replace(/"([^"]+(?="))"/g, "$1"),
  };
}

module.exports = {
  joiErrorParser,
};
