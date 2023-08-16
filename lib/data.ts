
export async function getPlans() {
  // Gets all active plans
  return await prisma.plan.findMany({
    where: {
      NOT: {
        status: 'draft'
      }
    }
  });
}


export async function getPlan(variantId) {
  // Gets all active plans
  return await prisma.plan.findFirst({
    where: {
      variantId: variantId,
      NOT: {
        status: 'draft'
      }
    }
  });
}


export async function getSubscription(userId) {
  // Gets the most recent subscription
  return await prisma.subscription.findFirst({
    where: {
      userId: userId
    },
    include: {
      plan: true
    },
    orderBy: {
      lemonSqueezyId: 'desc'
    }
  });
}