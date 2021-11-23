import { redirect, createCookieSessionStorage } from "remix"
import bcrypt from "bcrypt"
import { db } from "~/utils/db.server"

type LoginForm = {
  username: string
  password: string
}

export async function login({ username, password }: LoginForm) {
  const user = await db.user.findUnique({ where: { username } })
  if (!user) return null

  const isCorrect = await bcrypt.compare(password, user.passwordHash)
  if (!isCorrect) return null

  return user
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error("SESSION_SECRET is not set")

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set("userId", userId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  })
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"))
}

async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get("userId")
  if (typeof userId !== "string") return null
  return userId
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request)
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (!userId || typeof userId !== "string") {
    return null
  }
  try {
    const user = await db.user.findUnique({ where: { id: userId } })
    return user
  } catch {
    throw logout(request)
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  })
}
