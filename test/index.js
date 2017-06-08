const path = require('path');
const expect = require('expect.js');
const bemDeps = require('@bem/deps');
const resolveDeps = require('../lib/resolve-deps');
const runWebpack = require('./helpers/run-webpack');

// const bemConfig = require('bem-config');
// describe('bem-config', () => {
//   it('should provide correct levels map', () => {
//     return bemConfig().levelMap().then((levelMap) => {
//       expect(levelMap).to.an('object');
//       expect(Object.keys(levelMap).length).to.eql(4);
//     });
//   });
// });

describe('bem-deps', () => {
  it('not fail with empty levels', () => {
    const levels = [];

    const declaration = [{block: 'page'}];

    const techMap = {
      styles: ['css', 'scss'],
      scripts: ['js', 'babel.js'],
      html: ['bh.js'],
    };

    return bemDeps.load({levels: levels}).then((relations) => {
      return resolveDeps(declaration, relations, techMap);
    }).then((relations) => {
      expect(relations).to.eql({
          'styles': [{block: 'page'}],
          'scripts': [{block: 'page'}],
          'html': [{block: 'page'}],
        }
      );
    });
  });

  it('not fail with empty techs', () => {
    const levels = [
      'test/levels/blocks.base',
      'test/levels/blocks.plugins',
      'test/levels/blocks.common',
    ];

    const declaration = [{block: 'page'}];

    const techMap = {
      styles: [],
      scripts: [],
      html: [],
    };

    return bemDeps.load({levels: levels}).then((relations) => {
      return resolveDeps(declaration, relations, techMap);
    }).then((relations) => {
      expect(relations).to.eql({
          'styles': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
          ],
          'scripts': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
          ],
          'html': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
          ],
        }
      );
    });
  });

  it('not fail with empty declarations', () => {
    const levels = [
      'test/levels/blocks.base',
      'test/levels/blocks.plugins',
      'test/levels/blocks.common',
    ];

    const declaration = [];

    const techMap = {
      styles: ['css', 'scss'],
      scripts: ['js', 'babel.js'],
      html: ['bh.js'],
    };

    return bemDeps.load({levels: levels}).then((relations) => {
      return resolveDeps(declaration, relations, techMap);
    }).then((relations) => {
      expect(relations).to.eql({
          'styles': [],
          'scripts': [],
          'html': [],
        }
      );
    });
  });

  it('resolve deps as expected', () => {
    const levels = [
      'test/levels/blocks.base',
      'test/levels/blocks.plugins',
      'test/levels/blocks.common',
    ];

    const declaration = [
      {block: 'page'},
      {block: 'img', modName: 'lightbox', modVal: true},
    ];

    const techMap = {
      styles: ['css', 'scss'],
      scripts: ['js', 'babel.js'],
      html: ['bh.js'],
    };

    return bemDeps.load({levels: levels}).then((relations) => {
      return resolveDeps(declaration, relations, techMap);
    }).then((relations) => {
      expect(relations).to.eql({
          'styles': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
            {block: 'jquery'},
            {block: 'lightbox'},
            {block: 'img', mod: {name: 'lightbox', val: true}},
            {block: 'ua', elem: 'modern'},
          ],
          'scripts': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
            {block: 'jquery'},
            {block: 'lightbox'},
            {block: 'img', mod: {name: 'lightbox', val: true}},
          ],
          'html': [
            {block: 'page'},
            {block: 'page', elem: 'script'},
            {block: 'ua'},
            {block: 'jquery'},
            {block: 'lightbox'},
            {block: 'img', mod: {name: 'lightbox', val: true}},
          ],
        }
      );
    });
  });
});

describe('bemdeps-loader', () => {
  it('should pass normal bemjson', () => {
    const paths = getCasePaths('normal-bemjson');

    return runWebpack(paths.source).then((result) => {
      expect(result).to.eql(require(paths.expected));
    });
  });

  it('should pass normal bemjson without stringify', () => {
    const paths = getCasePaths('normal-bemjson');

    return runWebpack(paths.source, false).then((result) => {
      expect(result).to.eql(require(paths.expected));
    });
  });
});

/**
 * Generate paths to source and expected files
 *
 * @param {String} caseName
 * @return {{source: *, expected: *}}
 */
function getCasePaths(caseName) {
  return {
    'source': path.join(__dirname, 'cases', caseName,
      'source.bemjson.js'),
    'expected': path.join(__dirname, 'cases', caseName,
      'expected.bemjson.json'),
  };
}
