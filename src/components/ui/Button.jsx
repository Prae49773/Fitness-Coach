import { Link } from 'react-router-dom'

const variantClass = {
  primary: 'ui-button--primary',
  secondary: 'ui-button--secondary',
  ghost: 'ui-button--ghost',
}

const sizeClass = {
  sm: 'ui-button--sm',
  md: 'ui-button--md',
  lg: 'ui-button--lg',
  nav: 'ui-button--nav',
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  children,
  type = 'button',
  disabled,
  onClick,
  fullWidth = false,
  ...props
}) {
  const classes = cn(
    'ui-button focus-ring',
    variantClass[variant],
    sizeClass[size],
    fullWidth && 'ui-button--full',
    className
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
