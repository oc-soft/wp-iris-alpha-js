import IrisAlpha from './iris-alpha.js'

(()=> {
  const irisAlpha = new IrisAlpha()
  irisAlpha.bind() 

  if (typeof globalThis.addEventListener !== 'function') {
    globalThis.addEventListener('unload', 
      (event)=> { irisAlpha.unbind() }, 
      {
        once: true
      })
  }
})()
// vi: se ts=2 sw=2 et:
