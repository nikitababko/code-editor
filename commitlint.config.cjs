const cz = require('./commitizen.config.cjs');

const RULE_LEVEL = 2;

module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [RULE_LEVEL, 'always', cz.scopes.map((type) => type.name)],
    },
};
