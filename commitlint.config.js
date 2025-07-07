// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // ✨ New feature
        'fix', // 🐛 Bug fix
        'docs', // 📚 Documentation changes
        'style', // 💄 Code style changes (formatting, etc)
        'refactor', // ♻️ Code refactoring
        'perf', // ⚡ Performance improvements
        'test', // 🧪 Test related changes
        'build', // 🔧 Build system changes
        'ci', // 👷 CI/CD changes
        'chore', // 🔨 Maintenance tasks
        'revert', // ⏪ Revert previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
