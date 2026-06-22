import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getApiErrorMessage } from "../utils/apiErrors";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string().min(8, "Confirm your password."),
    role: z.enum(["SELLER", "BUYER"]),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "BUYER" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      const session = await registerRequest(values);
      setSession({
        accessToken: session.tokens.access,
        refreshToken: session.tokens.refresh,
        user: session.user,
      });
      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "We could not create your account. Please try again."));
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-blue-600">
              Marketplace
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Create your account and choose your role.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Sellers can manage products. Buyers can browse, cart, and checkout.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything stays in memory except the backend-issued tokens.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
                {errors.email ? (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                {errors.password ? (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm password
                </span>
                <input
                  {...register("passwordConfirmation")}
                  type="password"
                  className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                {errors.passwordConfirmation ? (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.passwordConfirmation.message}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Account type
                </span>
                <select
                  {...register("role")}
                  className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BUYER">Buyer</option>
                  <option value="SELLER">Seller</option>
                </select>
                {errors.role ? (
                  <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
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
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
