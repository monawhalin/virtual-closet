const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const monorepoRoot = path.resolve(__dirname, '../..')

const config = getDefaultConfig(__dirname)

// Tell Metro to watch the entire monorepo so it can resolve @vc/* packages
config.watchFolders = [monorepoRoot]

// Allow Metro to resolve modules from both the app's node_modules
// and the root node_modules (where pnpm hoists shared deps)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Make sure Metro can resolve TypeScript source files in workspace packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx']

module.exports = config
