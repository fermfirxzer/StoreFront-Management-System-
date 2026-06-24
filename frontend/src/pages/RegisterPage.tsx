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
        user: session.user,
      });
      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "We could not create your account. Please try again."));
    }
  };

  return (
    <main className="apple-surface min-h-screen text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-600">
              StoreFront-Management-System
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-bold tracking-tight text-brand-900 sm:text-6xl">
              Create your account and choose your role.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-apple-gray">
              Sellers can manage products. Buyers can browse, cart, and checkout.
            </p>
          </div>

          <div className="rounded-[2rem] bg-surface-card p-8 shadow-[0_20px_60px_rgba(99,102,241,0.12)] ring-1 ring-brand-100">
            <h2 className="text-2xl font-bold tracking-tight text-brand-900">Create account</h2>
            <p className="mt-2 text-sm text-apple-gray">
              Everything stays in memory except the backend-issued tokens.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-brand-900">
                  Email
                </span>
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
                <span className="mb-2 block text-sm font-semibold text-brand-900">
                  Password
                </span>
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

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-brand-900">
                  Confirm password
                </span>
                <input
                  {...register("passwordConfirmation")}
                  type="password"
                  className="w-full rounded-2xl border border-brand-200 bg-surface-input px-4 py-3 text-brand-900 shadow-sm ring-0 placeholder:text-[#A5B4FC] focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="••••••••"
                />
                {errors.passwordConfirmation ? (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.passwordConfirmation.message}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-brand-900">
                  Account type
                </span>
                <select
                  {...register("role")}
                  className="w-full rounded-2xl border border-brand-200 bg-surface-input px-4 py-3 text-brand-900 shadow-sm ring-0 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
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
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-2.5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all duration-200 hover:from-[#4F46E5] hover:to-[#7C3AED] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-apple-gray">
              Already have an account?{" "}
              <Link className="font-medium text-brand-600 hover:text-brand-700" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
