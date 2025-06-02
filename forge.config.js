const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Yixian Card Counter',
    executableName: 'yixian-card-counter',
    appBundleId: 'com.yixian.cardcounter',
    out: 'out',
    icon: './assets/icon',
    ignore: [
      /^\/src\//,
      /^\/electron\/.*\.ts$/,
      /^\/electron\/tsconfig\.json$/,
      /^\/public\//,
      /\.gitignore/,
      /\.git/
    ],
    prune: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'yixian-card-counter',
        setupExe: 'YixianCardCounterSetup.exe',
        setupIcon: './assets/icon.ico',
        loadingGif: './assets/loading.gif'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Yixian Card Counter',
          homepage: 'https://github.com/yourusername/yixian-card-counter'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/yourusername/yixian-card-counter'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
