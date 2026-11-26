// Configuração do Metro (empacotador do Expo).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Na web, o Metro escolhe "punycode.es6.js", que não exporta "ucs2". O polyfill de URL
// usado pelo Supabase e pelo widget do Pluggy quebra com
// "Cannot read properties of undefined (reading 'decode')". Forçamos a versão CommonJS,
// a mesma que o Android e o iOS já usam.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'punycode') {
    return { type: 'sourceFile', filePath: require.resolve('punycode/punycode.js') };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
