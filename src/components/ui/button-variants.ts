import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-academic-accent text-white hover:bg-academic-brand',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-academic-border bg-white text-academic-accent hover:border-academic-accent hover:bg-academic-surface',
        secondary: 'bg-academic-surface text-academic-accent hover:bg-academic-border',
        ghost: 'text-academic-accent hover:bg-academic-surface',
        link: 'text-academic-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export { buttonVariants };
