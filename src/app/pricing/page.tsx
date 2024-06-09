'use client';
import { useEffect, useState } from 'react';
import { type NewPlan as Plan } from "@/db/schema";
import { cn, formatPrice } from "@/lib/utils";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Plan as PlanComponent } from "@/components/dashboard/billing/plans/plan";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";

const PlansPage: React.FC = () => {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        const data: { plans: Plan[] } = await response.json();
        setPlans(data.plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchPlans();
  }, []);

  const sortedPlans = plans.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  return (
    <div className="w-full flex justify-center">
      <div className="mb-5 mt-3 max-w-xl grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {sortedPlans.map((plan, index) => (
          <div key={`plan-${index}`}>
            {session && (
              <div>
                <PlanComponent plan={plan} />
              </div>
            )}
            {!session && (
              <Card
                className="flex-1 w-full"
                key={plan.id}
                data-productid={plan.id}
                data-variantid={plan.id}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: plan.description ?? '',
                    }}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(plan.price)}
                  </div>
                  <ul className="my-4">
                    <li>Unlimited AI Quota</li>
                    <li>Customer support</li>
                  </ul>
                  <Link href={`/signin`}>
                    <Button>Choose Plan</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
