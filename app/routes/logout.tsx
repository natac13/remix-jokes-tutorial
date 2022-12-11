import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { logout } from "../utils/session.server"

// this will handle POST requests to the logout page
// which is what happens with the logout form action="/logout"
export const action: ActionFunction = async ({ request }) => {
  return logout(request)
}

export const loader: LoaderFunction = async () => {
  return redirect("/")
}
