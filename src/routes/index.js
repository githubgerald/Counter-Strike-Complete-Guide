// The single page of the site, rendered from content/guide.json.
const router = require('express').Router();
const { getContent } = require('../services/content');

router.get('/', (req, res) => {
  const { data, render, terms, autoexec } = getContent();
  res.render('index', {
    site: data.site, categories: data.categories, terms, autoexec,
    bibliography: data.bibliography, resources: data.resources || [], rt: render,
  });
});

module.exports = router;
