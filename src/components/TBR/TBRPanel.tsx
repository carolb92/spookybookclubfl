import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { SectionEmptyHint } from "@/components/common/SectionEmptyHint";

/**
 * "TBR" tab — skeleton for the to-be-read list.
 * Will be wired to real data later.
 */
export function TBRPanel() {
  // Placeholder items — will be replaced with real data
  const skeletonCount = 4;

  return (
    <div className="flex flex-col gap-3">
      <SectionEmptyHint>The pile of dread grows ever taller.</SectionEmptyHint>

      {Array.from({ length: skeletonCount }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
