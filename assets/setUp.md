 npm init
 npm i express
 npm install -D tailwindcss
 npx tailwindcss init

  -- create tailwind.css file
@tailwind base;
@tailwind components;
@tailwind utilities;

 -- modify tailwind.config.js  
 content: [`./views/*.ejs`],

 -- modify packageJson, build main.css file from tailwind
  "scripts": {
 "tw:build":"tailwindcss build -i ./assets/css/tailwind.css -o ./assets/css/main.css"
  }



-- add stylesheet link to cart.ejs
 <link rel="stylesheet" href="/css/main.css">

 <div class="w-[150px] h-[80px] shadow-2xl bg-white rounded-lg flex justify-center items-center">
  <p class="text-center">shadow-2xl</p>
</div>

-- run tw:build to create main.css file automatically
npm run tw:build



--install daisyUI
npm i @tailwindcss/typography daisyui

--Register daisyUI as a plugin (tailwind.config.js):
 plugins: [require('@tailwindcss/typography'),require('daisyui')],
 


-- run tw:build to create main.css file automatically
npm run tw:build


