import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getApiErrorMessage } from "../utils/apiErrors";
import AppleButton from "../components/apple/AppleButton";
import AppleCard from "../components/apple/AppleCard";
import AppleInput from "../components/apple/AppleInput";

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
      setErrorMessage(getApiErrorMessage(error, "We could not sign you in. Please check your details."));
    }
  };

  return (
    <main className="apple-surface min-h-screen text-apple-black animate-fade-in">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
        <AppleCard className="w-full max-w-[480px] p-6 sm:p-8 lg:p-10 shadow-apple-modal">
          <div className="text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
              Marketplace
            </p>
            <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.04em] sm:text-[40px]">
              Sign in
            </h1>
            <p className="mt-3 text-[17px] leading-7 text-apple-gray">
              Sign in to your account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <AppleInput
              {...register("email")}
              error={errors.email?.message}
              label="Email"
              placeholder="you@example.com"
              type="email"
            />

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-4">
                <span className="block text-[13px] font-medium uppercase tracking-[0.2px] text-apple-black">
                  Password
                </span>
                <button
                  className="text-[12px] font-medium text-apple-gray transition hover:text-apple-blue"
                  type="button"
                >
                  Forgot password?
                </button>
              </div>
              <AppleInput
                {...register("password")}
                error={errors.password?.message}
                label="Password"
                labelClassName="sr-only"
                placeholder="........"
                type="password"
              />
            </div>

            {errorMessage ? (
              <p className="rounded-apple-card border border-apple-red/20 bg-[#fff5f5] px-4 py-3 text-[13px] text-apple-red animate-shake">
                {errorMessage}
              </p>
            ) : null}

            <AppleButton fullWidth loading={isSubmitting} type="submit" variant="primary">
              Sign In
            </AppleButton>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-apple-border" />
              <span className="text-[12px] uppercase tracking-[0.2px] text-apple-gray">
                or
              </span>
              <div className="h-px flex-1 bg-apple-border" />
            </div>

            <AppleButton fullWidth to="/register" variant="secondary">
              Create an account
            </AppleButton>
          </form>

          <p className="mt-6 text-center text-[15px] leading-7 text-apple-gray">
            New here?{" "}
            <Link className="font-medium text-apple-blue transition hover:text-apple-blue-hover" to="/register">
              Create an account
            </Link>
          </p>
        </AppleCard>
      </section>
    </main>
  );
}
