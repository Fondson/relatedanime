import {
  ActionIcon,
  Checkbox,
  CheckboxGroup,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Radio,
  RadioGroup,
} from '@mantine/core'
import { IconAdjustments } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimeItemsByType } from 'types/common'

export type View = 'grouped' | 'timeline'

type ViewOptionsButtonProps = {
  defaultView: View
  onViewChange: (view: View) => void
  animes: AnimeItemsByType
  defaultSelectedMediaTypes?: string[]
  onSelectedMediaTypesChange: (mediaTypes: string[]) => void
}

const ViewOptionsButton = ({
  defaultView,
  onViewChange: onViewChangeProp,
  animes,
  defaultSelectedMediaTypes,
  onSelectedMediaTypesChange: onSelectedMediaTypesChangeProp,
}: ViewOptionsButtonProps) => {
  const [view, setView] = useState<View>(defaultView)
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[] | undefined>(
    defaultSelectedMediaTypes,
  )

  const mediaTypes = useMemo(() => {
    return Object.keys(animes).sort()
  }, [animes])

  useEffect(() => {
    setView(defaultView)
  }, [defaultView])

  useEffect(() => {
    setSelectedMediaTypes(defaultSelectedMediaTypes ? defaultSelectedMediaTypes : mediaTypes)
  }, [defaultSelectedMediaTypes])

  const onViewChange = useCallback(
    (view: View) => {
      setView(view)
      onViewChangeProp(view)
    },
    [onViewChangeProp],
  )

  const onSelectedMediaTypesChange = useCallback(
    (mediaTypes: string[]) => {
      setSelectedMediaTypes(mediaTypes)
      onSelectedMediaTypesChangeProp(mediaTypes)
    },
    [onSelectedMediaTypesChangeProp],
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
              <Radio
                value="grouped"
                label="Grouped"
                description="Group entries by media type"
                size="md"
              />
              <Radio
                value="timeline"
                label="Timeline"
                description="View entries as a timeline"
                size="md"
              />
            </div>
          </RadioGroup>

          <p className="mb-2">Filter</p>
          <CheckboxGroup value={selectedMediaTypes} onChange={onSelectedMediaTypesChange}>
            <div className="flex flex-col gap-2">
              {mediaTypes.map((mediaType) => (
                <Checkbox
                  key={mediaType}
                  value={mediaType}
                  label={`${mediaType} (${animes[mediaType].length})`}
                  size="md"
                />
              ))}
            </div>
          </CheckboxGroup>
        </div>
      </PopoverDropdown>
    </Popover>
  )
}

export default ViewOptionsButton
