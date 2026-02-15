import { defineConfig } from 'vite'

// Set the base to the repository name so asset URLs are correct when hosted
// at https://<user>.github.io/e-bat/
export default defineConfig({
  base: '/e-bat/'
})
