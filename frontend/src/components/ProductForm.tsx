import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productSchema, type ProductFormValues } from "../features/products/schema";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
          <input
            {...register("title")}
            className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-sky-500"
            placeholder="Minimal desk lamp"
          />
          {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p> : null}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-sky-500"
            placeholder="Describe the product, materials, and who it is for."
          />
          {errors.description ? (
            <p className="mt-2 text-sm text-rose-600">{errors.description.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Unit price</span>
          <div className="flex items-center rounded-2xl bg-slate-50 shadow-sm ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-sky-500">
            <span className="pl-4 text-sm font-semibold text-sky-700">THB</span>
            <input
              {...register("unitPrice", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full rounded-2xl border-0 bg-transparent px-3 py-3 text-slate-900 focus:ring-0"
              placeholder="149.99"
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Currency shown in Thai baht
          </p>
          {errors.unitPrice ? (
            <p className="mt-2 text-sm text-rose-600">{errors.unitPrice.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Quantity</span>
          <input
            {...register("quantity", { valueAsNumber: true })}
            type="number"
            step="1"
            className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-sky-500"
            placeholder="12"
          />
          {errors.quantity ? (
            <p className="mt-2 text-sm text-rose-600">{errors.quantity.message}</p>
          ) : null}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Product image</span>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-500"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setValue("image", file, { shouldValidate: true });
              if (!file) {
                setPreviewUrl(existingImageUrl);
                return;
              }
              const nextPreviewUrl = URL.createObjectURL(file);
              setPreviewUrl(nextPreviewUrl);
            }}
          />
          {errors.image ? <p className="mt-2 text-sm text-rose-600">{errors.image.message}</p> : null}
        </label>
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-[1.75rem] bg-slate-100 p-3 shadow-inner">
          <img
            alt="Product preview"
            className="h-64 w-full rounded-[1.25rem] object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}

      <button
        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#0369a1_60%,#22c55e_100%)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
