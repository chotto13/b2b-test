"use client"

import { Suspense } from "react"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="animate-pulse space-y-4">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-200" />
            <div className="mx-auto h-8 w-48 bg-slate-200" />
            <div className="h-64 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
