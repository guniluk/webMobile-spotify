/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: app과 components 하위 파일에 tailwind 스타일 적용
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
