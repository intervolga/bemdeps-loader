const bemDeps = require('@bem/deps');
const bemDecl = require('bem-decl');

/**
 * Resolve dependencies based on techMap
 *
 * @param {Array} declarations
 * @param {Array} relations
 * @param {Object} techMap
 * @return {Object}
 */
function resolveDeps(declarations, relations, techMap) {
  declarations || (declarations = []);
  relations || (relations = []);
  techMap || (techMap = {});

  const depsGraph = bemDeps.buildGraph(relations);
  const depsMap = {};

  Object.keys(techMap).forEach((techType) => {
    depsMap[techType] = [];

    const noTechDeps = Array.from(
      depsGraph.dependenciesOf(declarations)
    ).map((e) => e.entity);
    depsMap[techType].push(noTechDeps);

    techMap[techType].forEach((techName) => {
      const techDeps = Array.from(
        depsGraph.dependenciesOf(declarations, techName)
      ).map((e) => e.entity);
      depsMap[techType].push(techDeps);
    });

    depsMap[techType] = bemDecl.merge.apply(null, depsMap[techType]);
  });

  return depsMap;
}

module.exports = resolveDeps;
