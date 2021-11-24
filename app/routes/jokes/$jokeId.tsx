import type { LoaderFunction, ActionFunction } from "remix"
import { Link, useCatch, useLoaderData, useParams, redirect } from "remix"
import { Joke } from "@prisma/client"

import { db } from "~/utils/db.server"
import { getUserId, requireUserId } from "~/utils/session.server"

type LoaderData = {
  joke: Joke
  isOwner: boolean
}
export const loader: LoaderFunction = async ({ request, params }) => {
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } })
  if (!joke) throw new Response("Joke not found", { status: 404 })
  const userId = await getUserId(request)
  const data: LoaderData = { joke, isOwner: joke.jokesterId === userId }
  return data
}

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData()
  if (form.get("_method") === "delete") {
    const userId = await requireUserId(request)
    const joke = await db.joke.findUnique({ where: { id: params.jokeId } })
    if (!joke) {
      throw new Response("Can't delete a joke that does not exist", {
        status: 404,
      })
    }
    if (joke.jokesterId !== userId) {
      throw new Response("Nice try. That's not your joke", { status: 401 })
    }
    await db.joke.delete({ where: { id: params.jokeId } })
    return redirect("/jokes")
  }
}

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<LoaderData>()
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to={`/jokes/${joke.id}`}>"{joke.name}" Permalink</Link>

      {isOwner && (
        <div className="jokes-footer">
          <form method="post">
            <input type="hidden" name="_method" value="delete" />
            <button type="submit" className="button">
              Delete
            </button>
          </form>
        </div>
      )}
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

  switch (caught.status) {
    case 404:
      return (
        <div className="error-container">
          Huh? What the heck is "{jokeId}" ?
        </div>
      )
    case 405:
      return (
        <div className="error-container">
          Huh? What are you trying to do here?
        </div>
      )
    case 401:
      return (
        <div className="error-container">
          You don't have permission to do that.
        </div>
      )
    default:
      throw new Error(`Unhandled error: ${caught.status}`)
  }
}
