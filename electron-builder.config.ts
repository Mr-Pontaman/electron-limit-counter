import type { Configuration } from "electron-builder";
import { APP_NAME, GITHUB_REPO, GITHUB_USERNAME } from "./constants";

const config: Configuration = {
  appId: "com.mr_pontaman.limitcounter",
  productName: APP_NAME,
  directories: {
    buildResources: "build"
  },
  files: [
    "!**/.vscode/*",
    "!src/*",
    "!electron.vite.config.{js,ts,mjs,cjs}",
    "!{.eslintcache,eslint.config.mjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}",
    "!{.env,.env.*,.npmrc,pnpm-lock.yaml}",
    "!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}"
  ],
  asarUnpack: ["resources/**"],
  win: {
    executableName: APP_NAME
  },
  nsis: {
    artifactName: "${name}-${version}-setup.${ext}",
    shortcutName: "${productName}",
    uninstallDisplayName: "${productName}",
    createDesktopShortcut: "always"
  },
  mac: {
    entitlementsInherit: "build/entitlements.mac.plist",
    extendInfo: {
      NSCameraUsageDescription: "Application requests access to the device's camera.",
      NSMicrophoneUsageDescription: "Application requests access to the device's microphone.",
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder."
    },
    notarize: false
  },
  dmg: {
    artifactName: "${name}-${version}.${ext}"
  },
  linux: {
    target: ["AppImage", "deb"],
    maintainer: GITHUB_USERNAME,
    category: "Utility"
  },
  appImage: {
    artifactName: "${name}-${version}.${ext}"
  },
  npmRebuild: false,
  publish: {
    provider: "github",
    owner: GITHUB_USERNAME,
    repo: GITHUB_REPO,
    releaseType: "release"
  }
};

export default config;
