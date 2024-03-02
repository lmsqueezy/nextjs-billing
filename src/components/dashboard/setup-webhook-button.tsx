"use client";

import { Button, Loading } from "@lemonsqueezy/wedges";
import { CheckIcon, WebhookIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { setupWebhook } from "@/app/actions";

export function SetupWebhookButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  const beforeElement = loading ? (
    <Loading size="sm" className="size-4" />
  ) : (
    <WebhookIcon className="size-4" />
  );

  return (
    <Button
      disabled={disabled || loading || activated}
      before={
        !activated && !disabled ? (
          beforeElement
        ) : (
          <CheckIcon className="size-4" />
        )
      }
      onClick={async () => {
        setLoading(true);
        try {
          await setupWebhook();
          toast.success("Webhook set up successfully.");
        } catch (error) {
          // eslint-disable-next-line no-console -- allow
          console.error(error);
          toast("Error setting up a webhook.", {
            description:
              "Please check the server console for more information.",
          });
        } finally {
          setActivated(true);
          setLoading(false);
        }
      }}
    >
      Setup Webhook
    </Button>
  );
}
