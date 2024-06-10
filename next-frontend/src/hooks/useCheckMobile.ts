import { useOs } from '@mantine/hooks'

const useCheckMobile = () => {
  const os = useOs()
  return ['ios', 'android'].includes(os)
}

export default useCheckMobile
