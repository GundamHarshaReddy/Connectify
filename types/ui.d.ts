import { VariantProps } from 'class-variance-authority';

// Add any common variant types here
declare module 'react' {
  interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
    // Add any common HTML attributes here
  }
}
