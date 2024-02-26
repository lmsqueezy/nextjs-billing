import { Badge, type BadgeProps } from "@lemonsqueezy/wedges";
import { type SubscriptionStatusType } from "@/types/types";

export function SubscriptionStatus({
  status,
  statusFormatted,
  isPaused,
}: {
  status: SubscriptionStatusType;
  statusFormatted: string;
  isPaused?: boolean;
}) {
  const statusColor: Record<SubscriptionStatusType, BadgeProps["color"]> = {
    active: "green",
    cancelled: "gray",
    expired: "red",
    past_due: "red",
    on_trial: "primary",
    unpaid: "red",
    pause: "yellow",
    paused: "yellow",
  };

  const _status = isPaused ? "paused" : status;
  const _statusFormatted = isPaused ? "Paused" : statusFormatted;

  return (
    <>
      {status !== "cancelled" && (
        <span className="text-surface-200">&bull;</span>
      )}

      <Badge
        className="rounded-sm px-1 py-0 text-sm"
        size="sm"
        color={statusColor[_status]}
      >
        {_statusFormatted}
      </Badge>
    </>
  );
}
