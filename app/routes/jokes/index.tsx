import { Joke } from "@prisma/client"
import { LoaderFunction } from "@remix-run/server-runtime"
import { Link, useLoaderData } from "remix"
import { db } from "~/utils/db.server"

type LoaderData = {
  joke: Joke
}
export const loader: LoaderFunction = async () => {
  const count = await db.joke.count()
  const randomRowNumber = Math.floor(Math.random() * count)
  const [joke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  })
  const data: LoaderData = { joke }
  return data
}

export default function JokesIndexRoute() {
  const { joke } = useLoaderData<LoaderData>()

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
      <Link to={`/jokes/${joke.id}`}>"{joke.name}" Permalink</Link>
    </div>
  )
}
