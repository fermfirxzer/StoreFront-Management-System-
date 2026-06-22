import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getApiErrorMessage } from "../utils/apiErrors";
import AppleButton from "../components/apple/AppleButton";
import AppleCard from "../components/apple/AppleCard";
import AppleInput from "../components/apple/AppleInput";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", role: "BUYER" },
  });
  const selectedRole = watch("role");

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
    <main className="apple-surface min-h-screen text-apple-black animate-fade-in">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
        <AppleCard className="w-full max-w-[560px] p-6 sm:p-8 lg:p-10 shadow-apple-modal">
          <div className="text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
              Marketplace
            </p>
            <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.04em] sm:text-[40px]">
              Create your account
            </h1>
            <p className="mt-3 text-[17px] leading-7 text-apple-gray">
              A clean onboarding flow with a quick role choice and room to grow.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <AppleInput
                {...register("fullName")}
                error={errors.fullName?.message}
                label="Full name"
                placeholder="Alex Johnson"
              />
              <AppleInput
                {...register("email")}
                error={errors.email?.message}
                label="Email"
                placeholder="you@example.com"
                type="email"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <AppleInput
                {...register("password")}
                error={errors.password?.message}
                label="Password"
                placeholder="........"
                type="password"
              />
              <AppleInput
                {...register("passwordConfirmation")}
                error={errors.passwordConfirmation?.message}
                label="Confirm password"
                placeholder="........"
                type="password"
              />
            </div>

            <div>
              <span className="mb-2 block text-[13px] font-medium uppercase tracking-[0.2px] text-apple-black">
                Role
              </span>
              <div className="grid grid-cols-2 rounded-[10px] bg-apple-gray-light p-1">
                <label className="cursor-pointer">
                  <input
                    {...register("role")}
                    className="peer sr-only"
                    type="radio"
                    value="SELLER"
                  />
                  <span
                    className={[
                      "flex items-center justify-center rounded-[8px] px-4 py-3 text-[17px] font-medium transition-all duration-150 ease-apple",
                      selectedRole === "SELLER"
                        ? "bg-white text-apple-black shadow-sm"
                        : "text-apple-gray",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    Seller
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    {...register("role")}
                    className="peer sr-only"
                    type="radio"
                    value="BUYER"
                  />
                  <span
                    className={[
                      "flex items-center justify-center rounded-[8px] px-4 py-3 text-[17px] font-medium transition-all duration-150 ease-apple",
                      selectedRole === "BUYER"
                        ? "bg-white text-apple-black shadow-sm"
                        : "text-apple-gray",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    Buyer
                  </span>
                </label>
              </div>
              {errors.role ? (
                <p className="mt-1 text-[12px] text-apple-red animate-shake">{errors.role.message}</p>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="rounded-apple-card border border-apple-red/20 bg-[#fff5f5] px-4 py-3 text-[13px] text-apple-red animate-shake">
                {errorMessage}
              </p>
            ) : null}

            <AppleButton fullWidth loading={isSubmitting} type="submit" variant="primary">
              Create Account
            </AppleButton>
          </form>

          <p className="mt-6 text-center text-[15px] leading-7 text-apple-gray">
            Already have an account?{" "}
            <Link className="font-medium text-apple-blue transition hover:text-apple-blue-hover" to="/login">
              Sign in
            </Link>
          </p>
        </AppleCard>
      </section>
    </main>
  );
}
