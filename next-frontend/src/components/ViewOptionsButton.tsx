import {
  ActionIcon,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  RadioCard as MantineRadioCard,
  RadioGroup,
  RadioIndicator,
  Text,
} from '@mantine/core'
import { IconAdjustments } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'

export type View = 'grouped' | 'timeline'

type ViewOptionsButtonProps = {
  defaultView: View
  onViewChange: (view: View) => void
}

const ViewOptionsButton = ({
  defaultView,
  onViewChange: onViewChangeProp,
}: ViewOptionsButtonProps) => {
  const [view, setView] = useState<View>(defaultView)

  useEffect(() => {
    setView(defaultView)
  }, [defaultView])

  const onViewChange = useCallback(
    (view: View) => {
      setView(view)
      onViewChangeProp(view)
    },
    [onViewChangeProp],
  )

  return (
    <Popover position="bottom" withArrow shadow="md">
      <PopoverTarget>
        <ActionIcon variant="transparent" aria-label="Options" className="h-8 w-8">
          <IconAdjustments className="h-full w-full" />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown>
        <div>
          <p className="mb-2">View</p>
          <RadioGroup value={view} onChange={onViewChange as (view: string) => void}>
            <div className="flex flex-col gap-2">
              <RadioCard
                value="grouped"
                label="Grouped"
                description="Group entries by media type"
              />
              <RadioCard
                value="timeline"
                label="Timeline"
                description="View entries as a timeline"
              />
            </div>
          </RadioGroup>
        </div>
      </PopoverDropdown>
    </Popover>
  )
}

type RadioCardProps = {
  value: View
  label: string
  description: string
}

const RadioCard = ({ value, label, description }: RadioCardProps) => {
  return (
    <MantineRadioCard value={value} className="border-0">
      <div className="flex">
        <RadioIndicator />
        <div className="ml-2">
          <Text>{label}</Text>
          <Text className="text-sm" c="dimmed">
            {description}
          </Text>
        </div>
      </div>
    </MantineRadioCard>
  )
}

export default ViewOptionsButton
