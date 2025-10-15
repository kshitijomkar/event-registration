/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A pure monochromatic palette
        background: 'hsl(0 0% 100%)',      // White
        foreground: 'hsl(0 0% 3.9%)',      // Near Black for primary text
        card: 'hsl(0 0% 100%)',            
        'card-foreground': 'hsl(0 0% 3.9%)',
        muted: 'hsl(0 0% 96.1%)',          // Subtle light gray backgrounds
        'muted-foreground': 'hsl(0 0% 45.1%)', // Lighter text for secondary info
        border: 'hsl(0 0% 90.9%)',         // Borders
        input: 'hsl(0 0% 89.8%)',
        ring: 'hsl(0 0% 3.9%)',            // Focus ring will be dark
        
        // Primary actions will now use the darkest shade
        primary: 'hsl(0 0% 9%)',           // e.g., bg-primary for buttons
        'primary-hover': 'hsl(0 0% 3.9%)',   // Darker shade for hover
        'primary-foreground': 'hsl(0 0% 98%)', // Text on primary buttons (near white)
      },
      borderRadius: {
        lg: `0.75rem`,
        md: `calc(0.75rem - 2px)`,
        sm: `calc(0.75rem - 4px)`,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}