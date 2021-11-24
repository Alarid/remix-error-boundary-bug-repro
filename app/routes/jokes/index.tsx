import { Joke } from "@prisma/client"
import { LoaderFunction } from "@remix-run/server-runtime"
import { Link, useCatch, useLoaderData } from "remix"
import { db } from "~/utils/db.server"

type LoaderData = {
  randomJoke: Joke
}
export const loader: LoaderFunction = async () => {
  const count = await db.joke.count()
  const randomRowNumber = Math.floor(Math.random() * count)
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  })
  if (!randomJoke) {
    throw new Response("No random joke found", { status: 404 })
  }
  const data: LoaderData = { randomJoke }
  return data
}

export default function JokesIndexRoute() {
  const { randomJoke } = useLoaderData<LoaderData>()

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{randomJoke.content}</p>
      <Link to={`/jokes/${randomJoke.id}`}>"{randomJoke.name}" Permalink</Link>
    </div>
  )
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>
}

export function CatchBoundary() {
  let caught = useCatch()

  if (caught.status === 404) {
    return <div className="error-container">There are no jokes to display</div>
  }

  throw new Error(`Unhandled error: ${caught.status}`)
}
