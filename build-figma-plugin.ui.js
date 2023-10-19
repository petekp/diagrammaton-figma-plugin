module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    define: {
      "process.env.NODE_ENV": `'${process.env.NODE_ENV}'`,
    },
  };
};
