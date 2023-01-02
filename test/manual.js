import fn from '../src/vercel.js'

const data = await fn('vercel-preview-action-test', 'main', {})

console.log(data)
