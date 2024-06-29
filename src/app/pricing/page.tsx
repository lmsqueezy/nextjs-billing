'use client';
import { useEffect, useState } from 'react';
import { type NewPlan as Plan } from "@/db/schema";
import { cn, formatPrice } from "@/lib/utils";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { CardTitle, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card";
import { SignupButton } from '@/components/dashboard/billing/plans/signup-button';
import { CircleCheckBigIcon } from 'lucide-react';
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
    <>
      <h1 className='background-image py-10 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white mx-auto'>
        Pricing
      </h1>
      <div className="w-full flex justify-center gap-4 p-8 bg-svg">
        <Card
                className="w-[300px]"
              >
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <div className="text-2xl font-bold">
                    Free
                  </div>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">free</span></div></div>
                                  </CardHeader>
                <CardContent className='h-[200px]'>
                      <div className="text-large text-default-500 my-4 flex" >
                        <CircleCheckBigIcon color="blue" className="mr-4" /><span>Browse only</span>
                      </div>
                      <div className="text-large text-default-500 my-4 flex" >
                        <CircleCheckBigIcon color="blue" className="mr-4" /><span>No AI rewrite </span>
                      </div>
                </CardContent>
                <CardFooter>
                {!session ? (
                    <Link href={`/signin`}>
                      <Button className="w-full" >Get Started</Button>
                    </Link>
                  ) : (
                      <Button className="w-full" disabled={true}>Choose Plan</Button>
                  )}
                </CardFooter>
              </Card>
          {sortedPlans.map((plan, index) => (
            <div key={`plan-${index}`}>
              <Card
                className="w-[300px]"
                key={plan.id}
                data-productid={plan.id}
                data-variantid={plan.id}
              >
                <CardHeader>
                  <CardTitle>{plan.productName}</CardTitle>
                  <div className="text-2xl font-bold">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{plan.name}</span></div></div>
                                  </CardHeader>
                <CardContent className='h-[200px]'>
                  {plan.description ? (
                    plan.description.split(";").map((line: string, index: number) => (
                      <div className="text-large text-default-500 my-4 flex" key={index}>
                        <CircleCheckBigIcon color="blue" className="mr-4" /><span>{line}</span>
                      </div>
                    ))
                  ) : null}
                </CardContent>
                <CardFooter>
                {!session ? (
                    <Link href={`/signin`}>
                      <Button className="w-full">Choose Plan</Button>
                    </Link>
                  ) : (
                    <SignupButton
                      className="w-full"
                      plan={plan}
                      isChangingPlans={false}
                    />
                  )}
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
    </>
  );
};

export default PlansPage;
