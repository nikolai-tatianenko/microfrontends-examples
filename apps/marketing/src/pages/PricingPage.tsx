import { useQuery } from "@apollo/client";
import { ErrorState, Layout, PricingGrid, Progress } from "@blog/ui";
import { PlansQuery } from "../graphql/operations";

type Plans = React.ComponentProps<typeof PricingGrid>["plans"];

export function PricingPageView({
  plans,
  loading,
  error,
  onRetry,
}: {
  plans?: Plans;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}) {
  return (
    <Layout title="Pricing">
      {loading && <Progress />}
      {error && <ErrorState message={error} onRetry={onRetry} />}
      {plans && <PricingGrid plans={plans} />}
    </Layout>
  );
}

export function PricingPage() {
  const { data, loading, error, refetch } = useQuery(PlansQuery);
  const plans = data?.plans.map((plan) => ({
    ...plan,
    ctaLabel: plan.priceUsd === 0 ? "Get started" : "Start trial",
    ctaTo: "/auth/signup",
  }));
  return (
    <PricingPageView
      plans={plans}
      loading={loading}
      error={error?.message}
      onRetry={() => void refetch()}
    />
  );
}
