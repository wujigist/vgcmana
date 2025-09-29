// postcss.config.cjs
module.exports = {
  plugins: {
    // ⬅️ CHANGE: Swapping the v4 specific plugin for the standard Tailwind plugin
    'tailwindcss': {}, 
    'autoprefixer': {},
  },
};