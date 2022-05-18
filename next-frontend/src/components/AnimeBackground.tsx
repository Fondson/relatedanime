import { useEffect, useState } from 'react'
import getRandomInt from 'utils/getRandomInt'

const pics = [
  '/images/no-game-no-life-general.jpg',
  '/images/sakaeno-general.jpg',
  '/images/steins-gate-general.jpg',
]
const numOfPics = pics.length

type AnimeBackgroundProps = {
  picNum?: number
  id?: string
  children?: React.ReactNode
}

const AnimeBackground = ({ picNum, id, children }: AnimeBackgroundProps) => {
  const [img, setImg] = useState(pics[0])
  useEffect(() => {
    setImg(pics[picNum ?? getRandomInt(0, numOfPics - 1)])
  }, [picNum])

  return (
    <div
      className="h-full w-full bg-cover bg-fixed bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${img}')` }}
      id={id}
    >
      {children}
    </div>
  )
}

export default AnimeBackground
export { numOfPics }
