import { NextPage } from 'next'
import ErrorPage from 'pages/error'

const Custom404: NextPage = () => {
  return <ErrorPage message="Whoa! How did you end up here? Let's go to a real page" />
}

export default Custom404
