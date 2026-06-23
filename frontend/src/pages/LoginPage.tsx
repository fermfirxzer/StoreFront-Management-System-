import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getApiErrorMessage } from "../utils/apiErrors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const session = await loginRequest(values);
      setSession({
        accessToken: session.tokens.access,
        user: session.user,
      });
      navigate("/");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We could not sign you in. Please check your details.")
      );
    }
  };

  return (
    <section className="py-4 text-slate-900 sm:py-6">
      <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-brand-600">
            Marketplace
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-bold tracking-tight text-brand-900 sm:text-6xl">
            Sign in to manage your store or start shopping.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-apple-gray">
            A minimal, secure login flow with in-memory JWT storage and automatic refresh handling.
          </p>
        </div>

        <div className="rounded-[2rem] bg-surface-card p-8 shadow-[0_20px_60px_rgba(99,102,241,0.12)] ring-1 ring-brand-100">
          <h2 className="text-2xl font-bold tracking-tight text-brand-900">Welcome back</h2>
          <p className="mt-2 text-sm text-apple-gray">Use the email you registered with.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-900">Email</span>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-2xl border border-brand-200 bg-surface-input px-4 py-3 text-brand-900 shadow-sm ring-0 placeholder:text-[#A5B4FC] focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                placeholder="you@example.com"
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-900">Password</span>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-2xl border border-brand-200 bg-surface-input px-4 py-3 text-brand-900 shadow-sm ring-0 placeholder:text-[#A5B4FC] focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                placeholder="••••••••"
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              ) : null}
            </label>

            {errorMessage ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition hover:from-brand-600 hover:to-violet-600 hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-apple-gray">
            New here?{" "}
            <Link className="font-medium text-brand-600 hover:text-brand-700" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

