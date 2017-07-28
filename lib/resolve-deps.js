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

  const declarationsFilter = {};
  declarations = declarations.filter((decl) => {
    const key = JSON.stringify(decl);
    if (declarationsFilter[key]) {
      return false;
    } else {
      declarationsFilter[key] = true;
      return true;
    }
  });

  const depsGraph = bemDeps.buildGraph(relations);
  const depsMap = {};

  const noTechDeps = Array.from(
    depsGraph.dependenciesOf(declarations)
  ).map((e) => e.entity);

  Object.keys(techMap).forEach((techType) => {
    depsMap[techType] = [noTechDeps];

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
