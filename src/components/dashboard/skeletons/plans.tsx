import { CardSkeleton } from "./card";

export function PlansSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
      <CardSkeleton className="h-[211px]" />
      <CardSkeleton className="h-[211px]" />
    </div>
  );
}
