import ngnlGeneral from 'media/no-game-no-life-general.jpg'
import sakaenoGeneral from 'media/sakaeno-general.jpg'
import steinsGateGeneral from 'media/steins-gate-general.jpg'

const numOfPics = 3

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type AnimeBackgroundProps = {
  picNum: number
  id?: string
  children?: React.ReactNode
}

const AnimeBackground = ({ picNum, id, children }: AnimeBackgroundProps) => {
  let img: string
  switch (picNum) {
    case 0:
      img = sakaenoGeneral
      break
    case 1:
      img = ngnlGeneral
      break
    case 2:
      img = steinsGateGeneral
      break
    default:
  }

  return (
    <div
      className="h-full w-full bg-cover bg-fixed bg-center bg-no-repeat"
      style={{ backgroundImage: "url('" + img + "')" }}
      id={id}
    >
      {children}
    </div>
  )
}

export { AnimeBackground, numOfPics, getRandomInt }
