'use client';
import { useEffect, useState } from 'react';

interface Plan {
  id: number;
  productId: number;
  productName?: string;
  variantId: number;
  name: string;
  description?: string;
  price: string;
  isUsageBased?: boolean;
  interval?: string;
  intervalCount?: number;
  trialInterval?: string;
  trialIntervalCount?: number;
  sort?: number;
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await fetch('/api/plans');
      const data = await response.json();
      setPlans(data.plans);
    };

    fetchPlans();
  }, []);

  return (
    <div>
      <h1>Plans</h1>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <p>Price: {plan.price}</p>
            {plan.interval && <p>Interval: {plan.interval}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlansPage;
