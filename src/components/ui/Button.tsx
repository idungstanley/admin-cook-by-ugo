import type { ComponentProps } from 'react'
import { buttonStyles, type ButtonStyleProps } from './button.styles'

type ButtonProps = ComponentProps<'button'> & ButtonStyleProps

export const Button = ({ variant, size, fullWidth, className, type, ...props }: ButtonProps) => (
  <button
    type={type ?? 'button'}
    className={buttonStyles({ variant, size, fullWidth, className })}
    {...props}
  />
)
