module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Las migraciones de Drizzle se importan como texto (.sql)
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
