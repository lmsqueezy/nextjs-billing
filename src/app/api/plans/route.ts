import { NextResponse } from 'next/server';
import { db, plans } from '@/db/schema'; // Adjust the import path as necessary
import { eq } from 'drizzle-orm';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const planId = searchParams?.get('planId');

  // If planId is provided, fetch the specific plan, otherwise fetch all plans
  if (planId) {
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, Number(planId)))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan: plan[0] }, { status: 200 });
  } else {
    const allPlans = await db.select().from(plans);
    return NextResponse.json({ plans: allPlans }, { status: 200 });
  }
};
