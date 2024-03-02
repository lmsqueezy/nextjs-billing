"use client";

import { Button, Tooltip } from "@lemonsqueezy/wedges";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export const PageTitleAction = () => {
  return (
    <Tooltip
      align="center"
      arrow={false}
      content="Add new"
      delayDuration={0}
      side="bottom"
      sideOffset={6}
    >
      <Button
        className="size-10"
        shape="pill"
        before={<PlusIcon className="size-5" />}
        onClick={() => toast("This demo action isn't supposed to do anything.")}
      />
    </Tooltip>
  );
};
