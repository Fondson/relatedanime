import { Button, ButtonProps, PolymorphicComponentProps } from '@mantine/core'

type LinkButtonProps = Exclude<
  PolymorphicComponentProps<'button', ButtonProps>,
  'variant' | 'color'
>

const LinkButton = ({ children, ...rest }: LinkButtonProps) => {
  return (
    <Button
      variant="transparent"
      color="blue"
      size="compact-sm"
      className="hover:underline"
      {...rest}
    >
      {children}
    </Button>
  )
}

export default LinkButton
