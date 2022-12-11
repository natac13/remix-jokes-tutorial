import type { ActionArgs, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useActionData, useCatch } from "@remix-run/react"

import { db } from "~/utils/db.server"
import { badRequest } from "~/utils/request.server"
import { getUserId, requireUserId } from "../../utils/session.server"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (!userId) {
    throw new Response("Login Please", {
      status: 401,
    })
  }
  return {}
}

export function CatchBoundary() {
  const caught = useCatch()
  if (caught.status === 401 && caught.data === "Login Please") {
    return (
      <div className="error-container">
        <p>You must login to create a joke</p>
        <Link to="/login">Login</Link>
      </div>
    )
  }
}

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return `That joke is too short`
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return `That joke's name is too short`
  }
}

type ActionData = {
  fieldErrors?: {
    name?: string
    content?: string
  }
  fields?: {
    name?: string
    content?: string
  }
  formError?: string
}

export const action = async ({
  request,
}: ActionArgs): Promise<Response | ActionData> => {
  const userId = await requireUserId(request)

  // form data
  const form = await request.formData()
  const name = form.get("name")
  const content = form.get("content")
  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Form not submitted correctly.`,
    })
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  }
  const fields = { name, content }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    })
  }

  const joke = await db.joke.create({ data: { ...fields, jokesterId: userId } })
  return redirect(`/jokes/${joke.id}`)
}

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>()

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  )
}
export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  )
}
