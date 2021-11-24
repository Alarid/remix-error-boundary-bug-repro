import { Joke } from "@prisma/client"
import { LoaderFunction } from "@remix-run/server-runtime"
import { Link, useCatch, useLoaderData, useParams } from "remix"
import { db } from "~/utils/db.server"

type LoaderData = {
  joke: Joke
}
export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } })
  if (!joke) throw new Response("Joke not found", { status: 404 })
  const data: LoaderData = { joke }
  return data
}

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>()
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to={`/jokes/${joke.id}`}>"{joke.name}" Permalink</Link>
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  const { jokeId } = useParams()
  return (
    <div className="error-container">
      There was an error loading joke #{jokeId}, sorry.
    </div>
  )
}

export function CatchBoundary() {
  let caught = useCatch()
  const { jokeId } = useParams()

  if (caught.status === 404) {
    return (
      <div className="error-container">Huh? What the heck is "{jokeId}" ?</div>
    )
  }

  throw new Error(`Unhandled error: ${caught.status}`)
}
