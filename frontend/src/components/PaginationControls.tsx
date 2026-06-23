import AppleButton from "./apple/AppleButton";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isPending?: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  isPending = false,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-3">
        <button
          className={[
            "inline-flex items-center justify-center rounded-apple-pill px-6 py-3 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-150 ease-apple",
            currentPage <= 1 || isPending
              ? "cursor-not-allowed text-[#B3B3BD]"
              : "text-apple-gray hover:bg-[#EEF2FF] hover:text-[#4338CA]",
          ].join(" ")}
          disabled={currentPage <= 1 || isPending}
          onClick={() => {
            onPageChange(currentPage - 1);
          }}
          type="button"
        >
          Previous
        </button>
        <AppleButton
          disabled={currentPage >= totalPages || isPending}
          onClick={() => {
            onPageChange(currentPage + 1);
          }}
          variant="secondary"
        >
          Next
        </AppleButton>
      </div>
    </div>
  );
}
