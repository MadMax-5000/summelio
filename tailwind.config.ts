import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		fontSize: {
    			base: [
    				'15px',
    				'1.5'
    			]
    		},
    		colors: {
    			background: 'var(--background)',
    			foreground: 'var(--foreground)',
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
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	},
    	keyframes: {
    		typing: {
    			'0%, 100%': {
    				transform: 'translateY(0)',
    				opacity: '0.5'
    			},
    			'50%': {
    				transform: 'translateY(-2px)',
    				opacity: '1'
    			}
    		},
    		'loading-dots': {
    			'0%, 100%': {
    				opacity: '0'
    			},
    			'50%': {
    				opacity: '1'
    			}
    		},
    		wave: {
    			'0%, 100%': {
    				transform: 'scaleY(1)'
    			},
    			'50%': {
    				transform: 'scaleY(0.6)'
    			}
    		},
    		blink: {
    			'0%, 100%': {
    				opacity: '1'
    			},
    			'50%': {
    				opacity: '0'
    			}
    		}
    	},
    	'text-blink': {
    		'0%, 100%': {
    			color: 'var(--primary)'
    		},
    		'50%': {
    			color: 'var(--muted-foreground)'
    		}
    	},
    	'bounce-dots': {
    		'0%, 100%': {
    			transform: 'scale(0.8)',
    			opacity: '0.5'
    		},
    		'50%': {
    			transform: 'scale(1.2)',
    			opacity: '1'
    		}
    	},
    	'thin-pulse': {
    		'0%, 100%': {
    			transform: 'scale(0.95)',
    			opacity: '0.8'
    		},
    		'50%': {
    			transform: 'scale(1.05)',
    			opacity: '0.4'
    		}
    	},
    	'pulse-dot': {
    		'0%, 100%': {
    			transform: 'scale(1)',
    			opacity: '0.8'
    		},
    		'50%': {
    			transform: 'scale(1.5)',
    			opacity: '1'
    		}
    	},
    	'shimmer-text': {
    		'0%': {
    			backgroundPosition: '150% center'
    		},
    		'100%': {
    			backgroundPosition: '-150% center'
    		}
    	},
    	'wave-bars': {
    		'0%, 100%': {
    			transform: 'scaleY(1)',
    			opacity: '0.5'
    		},
    		'50%': {
    			transform: 'scaleY(0.6)',
    			opacity: '1'
    		}
    	},
    	shimmer: {
    		'0%': {
    			backgroundPosition: '200% 50%'
    		},
    		'100%': {
    			backgroundPosition: '-200% 50%'
    		}
    	},
    	'spinner-fade': {
    		'0%': {
    			opacity: '0'
    		},
    		'100%': {
    			opacity: '1'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
