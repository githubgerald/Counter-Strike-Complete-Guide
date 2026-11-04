// The single page of the site, rendered from content/guide.json.
const router = require('express').Router();
const { getContent } = require('../services/content');
const pkg = require('../../package.json');

router.get('/', (req, res) => {
  const { data, render, terms, autoexec } = getContent();
  res.set('Cache-Control', 'no-cache');
  res.render('index', {
    site: data.site, categories: data.categories, terms, autoexec,
    bibliography: data.bibliography, resources: data.resources || [], rt: render,
    totalModules: data.categories.filter((c) => c.quiz).length,
    appVersion: pkg.version,
  });
});

module.exports = router;
