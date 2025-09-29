// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    // This path is correct for scanning your source files
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};