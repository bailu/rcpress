const webpack = require('webpack');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { ChunkExtractor } = require('@loadable/server');

class Render {
  constructor(bundle, options, clientMfs) {
    this.bundle = bundle;
    this.options = options;
    this.clientMfs = clientMfs;
  }

  renderToString(context, cb) {
    try {
      const { clientManifest, template } = this.options;

      const nodeExtractor = new ChunkExtractor({
        stats: this.bundle,
        entrypoints: ['app']
      });
      const { default: CreateApp } = nodeExtractor.requireEntrypoint();

      const webExtractor = new ChunkExtractor({
        stats: clientManifest,
        entrypoints: ['app'],
        inputFileSystem: this.clientMfs
      });

      const jsx = webExtractor.collectChunks(CreateApp(context));
      const html = renderToString(jsx);
      const res = template
        .replace('{{{ html() }}}', html)
        .replace('{{{ scripts }}}', webExtractor.getScriptTags())
        .replace('{{{ links }}}', webExtractor.getLinkTags())
        .replace('{{{ styles }}}', webExtractor.getStyleTags());

      cb(null, res);
    } catch (error) {
      cb(error, null);
    }
  }
}

module.exports = Render;
