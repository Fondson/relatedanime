import {
  ActionIcon,
  Checkbox,
  CheckboxGroup,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Radio,
  RadioGroup,
  Text,
} from '@mantine/core'
import { IconAdjustments } from '@tabler/icons-react'
import LinkButton from 'components/LinkButton'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex flex-col gap-2">
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
          </div>

          <div>
            <div>
              <span>
                <span>Filter</span>{' '}
                <Text span c="dimmed">{`(${Object.values(animes).flat().length})`}</Text>
              </span>
            </div>
            <div className="mb-2 flex">
              <div className="ml-auto flex">
                <LinkButton onClick={() => onSelectedMediaTypesChange(mediaTypes)}>
                  Select All
                </LinkButton>
                <LinkButton onClick={() => onSelectedMediaTypesChange([])}>Clear</LinkButton>
              </div>
            </div>
            <CheckboxGroup value={selectedMediaTypes} onChange={onSelectedMediaTypesChange}>
              <div className="flex flex-col gap-2">
                {mediaTypes.map((mediaType) => (
                  <Checkbox
                    key={mediaType}
                    value={mediaType}
                    label={
                      <span>
                        <Text span>{mediaType}</Text>{' '}
                        <Text span c="dimmed">
                          {`(${animes[mediaType].length})`}
                        </Text>
                      </span>
                    }
                    size="md"
                  />
                ))}
              </div>
            </CheckboxGroup>
          </div>
        </div>
      </PopoverDropdown>
    </Popover>
  )
}

export default ViewOptionsButton
