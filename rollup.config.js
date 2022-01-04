import alias from '@rollup/plugin-alias'

const plugins = [
  alias({
    entries: [
      {
        find: /(image-resource-js)/,
        replacement: '../$1/dist/index.es.js'
      }
    ]
  })
]


const config = [
  {
    input: 'src/index.js', 
    external: ['jquery'],
    output: {
      file: 'dist/wp-iris-alpha.js',
      format: 'umd',
      globals: {
       jquery: 'jQuery'
      }
    },
    plugins
  },
  {
    input: 'src/iris-alpha.js', 
    external: ['jquery'],
    output: {
      file: 'dist/iris-alpha.es.js',
      format: 'es',
      globals: {
       jquery: 'jQuery'
      }
    },
    plugins
  }
]

export { config as default }
// vi: se ts=2 sw=2 et:
