import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_PRICE,
  MAX_PRODUCT_QUANTITY,
  MAX_PRODUCT_TITLE_LENGTH,
  productSchema,
  type ProductFormValues,
} from "../features/products/schema";
import AppleButton from "./apple/AppleButton";
import AppleCard from "./apple/AppleCard";
import AppleInput from "./apple/AppleInput";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  existingImageUrl?: string | null;
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

const emptyValues: ProductFormValues = {
  title: "",
  description: "",
  unitPrice: 1,
  quantity: 0,
};

export default function ProductForm({
  defaultValues,
  existingImageUrl = null,
  onSubmit,
  isLoading,
  submitLabel = "Save product",
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [createdObjectUrl, setCreatedObjectUrl] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...emptyValues,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      ...emptyValues,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  useEffect(() => {
    return () => {
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [createdObjectUrl]);

  const imagePreview = useMemo(() => previewUrl, [previewUrl]);
  const imageName = watch("image")?.name;
  const clampPrice = (rawValue: string) => {
    const parsedValue = Number(rawValue);
    if (!Number.isFinite(parsedValue)) {
      return 0;
    }
    return Math.min(Math.max(parsedValue, 0), MAX_PRODUCT_PRICE);
  };

  const clampQuantity = (rawValue: string) => {
    const parsedValue = Number(rawValue);
    if (!Number.isFinite(parsedValue)) {
      return 0;
    }
    return Math.min(Math.max(Math.trunc(parsedValue), 0), MAX_PRODUCT_QUANTITY);
  };

  const syncPreviewFromFile = (file?: File) => {
    if (createdObjectUrl) {
      URL.revokeObjectURL(createdObjectUrl);
      setCreatedObjectUrl(null);
    }

    if (!file) {
      setPreviewUrl(existingImageUrl);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setCreatedObjectUrl(nextPreviewUrl);
    setPreviewUrl(nextPreviewUrl);
  };

  const clearImage = () => {
    setValue("image", undefined, { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (createdObjectUrl) {
      URL.revokeObjectURL(createdObjectUrl);
      setCreatedObjectUrl(null);
    }
    setPreviewUrl(null);
  };

  const handleFileChange = (file?: File) => {
    setValue("image", file, { shouldValidate: true, shouldDirty: true });
    syncPreviewFromFile(file);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <AppleCard className="space-y-6 border-t-4 border-t-brand-500">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Product details
            </p>
            <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-brand-900">
              Build a polished listing
            </h2>
          </div>

          <Controller
            control={control}
            name="title"
            render={({ field }) => {
              const titleText = field.value ?? "";

              return (
                <AppleInput
                  ref={field.ref}
                  error={errors.title?.message}
                  label="Product title"
                  placeholder="Minimal desk lamp"
                  maxLength={MAX_PRODUCT_TITLE_LENGTH}
                  hint={`${titleText.length}/${MAX_PRODUCT_TITLE_LENGTH}`}
                  value={titleText}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value.slice(0, MAX_PRODUCT_TITLE_LENGTH));
                  }}
                />
              );
            }}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => {
              const descriptionText = field.value ?? "";

              return (
                <AppleInput
                  ref={field.ref}
                  as="textarea"
                  error={errors.description?.message}
                  label="Description"
                  placeholder="Describe the product, materials, and who it is for."
                  rows={4}
                  maxLength={MAX_PRODUCT_DESCRIPTION_LENGTH}
                  hint={`${descriptionText.length}/${MAX_PRODUCT_DESCRIPTION_LENGTH}`}
                  value={descriptionText}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(
                      event.currentTarget.value.slice(0, MAX_PRODUCT_DESCRIPTION_LENGTH)
                    );
                  }}
                />
              );
            }}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={control}
              name="unitPrice"
              render={({ field }) => (
                <AppleInput
                  ref={field.ref}
                  error={errors.unitPrice?.message}
                  label="Price"
                  prefix="THB"
                  inputMode="decimal"
                  placeholder="149.99"
                  step="0.01"
                  type="number"
                  hint="Maximum THB 10,000,000."
                  min="0"
                  max={MAX_PRODUCT_PRICE}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const nextValue = clampPrice(event.currentTarget.value);
                    field.onChange(nextValue);
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <AppleInput
                  ref={field.ref}
                  error={errors.quantity?.message}
                  label="Quantity"
                  inputMode="numeric"
                  placeholder="12"
                  step="1"
                  type="number"
                  min="0"
                  max={MAX_PRODUCT_QUANTITY}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const nextValue = clampQuantity(event.currentTarget.value);
                    field.onChange(nextValue);
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-apple-card bg-brand-50 p-4 shadow-[0_1px_4px_rgba(99,102,241,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Quick note
            </p>
            <p className="text-[15px] leading-7 text-apple-gray">
              Keep product copy concise and specific. Clear titles and a simple
              first image do most of the work.
            </p>
          </div>
        </AppleCard>

        <AppleCard className="space-y-5 border-t-4 border-t-violet-500">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-600">
              Product image
            </p>
            <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-brand-900">
              Preview and upload
            </h2>
          </div>

          <div
            className={[
              "group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-apple-card border border-dashed bg-surface-input p-5 text-center transition-all duration-200 ease-apple",
              isDragging
                ? "border-brand-500 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                : "border-brand-200 hover:bg-white hover:shadow-[0_2px_12px_rgba(99,102,241,0.12)]",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              fileInputRef.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => {
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              handleFileChange(file);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            {imagePreview ? (
              <>
                <img
                  alt="Product preview"
                  className="h-full w-full rounded-apple-card object-cover"
                  src={imagePreview}
                />
                <div className="absolute inset-0 flex items-end justify-between gap-3 rounded-apple-card bg-gradient-to-t from-black/45 via-black/5 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-apple-pill bg-white/95 px-3 py-2 text-[12px] font-medium text-apple-black shadow-sm">
                    {imageName ?? "Current image"}
                  </span>
                  <button
                    className="rounded-full border-2 border-[#FF3B30] bg-white/95 px-4 py-2 text-[12px] font-semibold text-[#FF3B30] shadow-sm transition-all duration-150 hover:bg-[#FF3B30] hover:text-white active:scale-[0.98]"
                    onClick={(event) => {
                      event.stopPropagation();
                      clearImage();
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <div className="flex max-w-sm flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(99,102,241,0.12)]">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-brand-600"
                  >
                    <path
                      d="M12 16V8m0 0-3 3m3-3 3 3M5 16.5A3.5 3.5 0 0 1 6.2 9.7 5 5 0 0 1 16 8.3 3.5 3.5 0 1 1 17.5 16.5H5Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-[17px] font-medium text-apple-black">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[13px] leading-6 text-apple-gray">
                    PNG, JPG, WEBP up to 2 MB.
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              handleFileChange(file);
            }}
          />

          <div className="rounded-apple-card bg-brand-50 p-4 shadow-[0_1px_4px_rgba(99,102,241,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Accepted types
            </p>
            <p className="mt-2 text-[13px] leading-6 text-apple-gray">
              Common image formats are supported. A square or 16:9 image works
              especially well in the dashboard grid. Maximum image upload: 2 MB.
            </p>
          </div>

          {errors.image ? (
            <p className="text-[12px] text-apple-red animate-shake">{errors.image.message}</p>
          ) : null}
        </AppleCard>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <AppleButton
          variant="ghost"
          to="/seller"
          className="w-full px-6 py-2.5 text-[15px] sm:w-auto"
        >
          Cancel
        </AppleButton>
        <AppleButton
          className="w-full px-6 py-2.5 text-[15px] sm:w-auto"
          loading={isLoading}
          type="submit"
          variant="primary"
        >
          {submitLabel}
        </AppleButton>
      </div>
    </form>
  );
}
