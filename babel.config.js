module.exports = function(api) {
  console.log("wnet through contexts");
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
