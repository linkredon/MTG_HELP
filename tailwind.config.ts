import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		spacing: {
			'safe-top': 'env(safe-area-inset-top)',
			'safe-bottom': 'env(safe-area-inset-bottom)',
			'safe-left': 'env(safe-area-inset-left)',
			'safe-right': 'env(safe-area-inset-right)',
		},
  		colors: {
  			// HeroUI Color System
  			background: '#FFFFFF',
  			foreground: '#11181C',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#11181C'
  			},
  			popover: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#11181C'
  			},
  			primary: {
  				DEFAULT: '#0070F3',
  				50: '#EFF6FF',
  				100: '#DBEAFE',
  				200: '#BFDBFE',
  				300: '#93C5FD',
  				400: '#60A5FA',
  				500: '#0070F3',
  				600: '#0061D1',
  				700: '#0052AA',
  				800: '#1E3A8A',
  				900: '#1E40AF',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#F4F4F5',
  				foreground: '#09090B'
  			},
  			muted: {
  				DEFAULT: '#F4F4F5',
  				foreground: '#71717A'
  			},
  			accent: {
  				DEFAULT: '#F4F4F5',
  				foreground: '#09090B'
  			},
  			destructive: {
  				DEFAULT: '#F31260',
  				foreground: '#FFFFFF'
  			},
  			border: '#E4E4E7',
  			input: '#E4E4E7',
  			ring: '#0070F3',
  			// HeroUI Success Colors
  			success: {
  				DEFAULT: '#17C964',
  				50: '#F0FDF4',
  				100: '#DCFCE7',
  				500: '#17C964',
  				600: '#16A34A',
  				foreground: '#FFFFFF'
  			},
  			// HeroUI Warning Colors  
  			warning: {
  				DEFAULT: '#F5A524',
  				50: '#FFFBEB',
  				500: '#F5A524',
  				600: '#D97706',
  				foreground: '#FFFFFF'
  			},
  			// HeroUI Chart Colors
  			chart: {
  				'1': '#0070F3',
  				'2': '#F31260', 
  				'3': '#17C964',
  				'4': '#F5A524',
  				'5': '#9353D3'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: '12px',
  			md: '8px', 
  			sm: '6px',
  			xl: '16px',
  			'2xl': '20px'
  		},
  		boxShadow: {
  			'hero-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			'hero-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  			'hero-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			'hero-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  		},
		keyframes: {
			'hero-fade-in': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'hero-scale-in': {
				'0%': {
					opacity: '0',
					transform: 'scale(0.95)'
				},
				'100%': {
					opacity: '1',
					transform: 'scale(1)'
				}
			},
			'fadeIn': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'slideUp': {
				'0%': {
					opacity: '0',
					transform: 'translateY(20px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'scaleIn': {
				'0%': {
					opacity: '0',
					transform: 'scale(0.9)'
				},
				'100%': {
					opacity: '1',
					transform: 'scale(1)'
				}
			},
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			}
		},
		animation: {
			'hero-fade-in': 'hero-fade-in 0.3s ease-out',
			'hero-scale-in': 'hero-scale-in 0.2s ease-out',
			'fadeIn': 'fadeIn 0.3s ease-out',
			'slideUp': 'slideUp 0.4s ease-out',
			'scaleIn': 'scaleIn 0.2s ease-out',
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
