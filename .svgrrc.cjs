module.exports = {
  icon: true,
  typescript: true,
  svgoConfig: require('./svgo.config.cjs'),
  memo: true,
  template: require('./scripts/template.cjs'),
  outDir: 'src/icons',
};
