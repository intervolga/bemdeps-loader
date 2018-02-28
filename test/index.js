const fse = require('fs-extra');
const path = require('path');
const expect = require('expect.js');
const depToFS = require('../lib/dep-to-fs');
const resolveFS = require('../lib/resolve-fs');
const runWebpack = require('./helpers/run-webpack');
const watchWebpack = require('./helpers/watch-webpack');

describe('dep-to-fs', () => {
  it('should resolve to first existing tech implementation', () => {
    const result = depToFS(
      {block: 'page'},
      ['css', 'scss'],
      'test/levels/blocks.base'
    );
    expect(result).to.be.an('array');
    expect(result.length).to.be(2);
    expect(result[0]).to.contain('test/levels/blocks.base/page/page.css');
  });

  it('should be fast', () => {
    const start = process.hrtime();

    for (let i = 0; i < 10000; i++) {
      depToFS(
        {block: 'page'},
        ['css', 'scss'],
        'test/levels/blocks.base'
      );
    }
    const elapsed = process.hrtime(start);

    expect(elapsed).to.be.an('array');
    expect(elapsed[0]).to.be(0);
  });
});

describe('resolve-fs', () => {
  it('should resolve to correct file list', () => {
    const levels = [
      'test/levels/blocks.base',
      'test/levels/blocks.plugins',
      'test/levels/blocks.common',
      'test/levels/blocks.project',
    ];

    const techMap = {
      styles: ['css', 'scss'],
      scripts: ['js', 'babel.js'],
      html: ['bh.js'],
    };

    const deps = [
      {block: 'page'},
      {block: 'datepicker'},
    ];

    return resolveFS(deps, techMap, levels).then((result) => {
      expect(result).to.be.a('object');

      expect(result.found).to.be.an('array');
      expect(result.found.length).to.be(6);
      expect(result.found[0]).to
        .contain('test/levels/blocks.base/page/page.css');

      expect(result.dependecies).to.be.an('array');
      expect(result.dependecies.length).to.be(7);
    });
  });

  it('should resolve fs fast', () => {
    const levels = [
      'node_modules/bem-core/common.blocks',
      'node_modules/bem-core/desktop.blocks',
      'node_modules/bem-components/common.blocks',
      'node_modules/bem-components/desktop.blocks',
      'node_modules/bem-components/design/common.blocks',
      'node_modules/bem-components/design/desktop.blocks',
      'test/levels/blocks.base',
      'test/levels/blocks.plugins',
      'test/levels/blocks.common',
    ];

    const techMap = {
      styles: ['css', 'scss'],
      scripts: ['js', 'babel.js'],
      html: ['bh.js'],
    };

    const source = path.join(__dirname, 'cases', 'bemjson-speedtest',
      'source.bemdeps.json');
    const deps = require(source);

    const start = process.hrtime();
    return resolveFS(deps, techMap, levels).then(() => {
      const elapsed = process.hrtime(start);

      expect(elapsed).to.be.an('array');
      expect(elapsed[0]).to.be(0);
      expect(elapsed[1] / 1000000).to.be.below(250);
    });
  });
});

describe('bemfs-loader', () => {
  it('should pass normal bemjson', () => {
    const paths = getCasePaths('normal-bemjson');

    return runWebpack(paths.source).then((result) => {
      expect(result).to.eql(require(paths.expected));
    });
  });

  it('should invalidate cache when prioritized asset added', function(done) {
    this.timeout(30000); // eslint-disable-line no-invalid-this

    const paths = getCasePaths('bemjson-asset-add');

    const source = path.join(__dirname, 'levels', 'blocks.common',
      'add-asset', 'add-asset.css');
    const changed = path.join(__dirname, 'levels', 'blocks.common',
      'add-asset', 'add-asset_changed.css');


    fse.copySync(changed, source);
    fse.removeSync(source);

    let firstRun = false;
    let firstTimerId = null;
    let secondRun = false;
    let watching;
    const cb = (result) => {
      expect(typeof result).to.be.a('string');

      if (!firstRun) {
        if (firstTimerId) {
          clearTimeout(firstTimerId);
        }

        firstTimerId = setTimeout(() => {
          firstRun = true;
          fse.copySync(changed, source);
        }, 5000);
      } else if (!secondRun) {
        secondRun = true;
        setTimeout(() => {
          watching && watching.close();
          expect(result).to.eql(require(paths.expected));
          done();
        }, 5000);
      }
    };

    watching = watchWebpack(paths.source, cb);
  });

  it('should invalidate cache when prioritized asset removed', function(done) {
    this.timeout(30000); // eslint-disable-line no-invalid-this

    const paths = getCasePaths('bemjson-asset-remove');

    const source = path.join(__dirname, 'levels', 'blocks.common',
      'remove-asset', 'remove-asset.css');
    const original = path.join(__dirname, 'levels', 'blocks.common',
      'remove-asset', 'remove-asset_original.css');

    fse.copySync(original, source);

    let firstRun = false;
    let firstTimerId = null;
    let secondRun = false;
    let watching;
    const cb = (result) => {
      expect(typeof result).to.be.a('string');

      if (!firstRun) {
        if (firstTimerId) {
          clearTimeout(firstTimerId);
        }

        firstTimerId = setTimeout(() => {
          firstRun = true;
          fse.removeSync(source);
        }, 5000);
      } else if (!secondRun) {
        secondRun = true;
        setTimeout(() => {
          watching && watching.close();
          expect(result).to.eql(require(paths.expected));
          done();
        }, 5000);
      }
    };

    watching = watchWebpack(paths.source, cb);
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
