import { Container, Grid } from "@mui/material";
import { PlanCard, type PlanCardProps } from "../molecules/PlanCard";

/** Side-by-side plan comparison. */
export function PricingGrid({
  plans,
}: {
  plans: Array<PlanCardProps & { id: string }>;
}) {
  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-test-id="pricing-grid">
      <Grid container spacing={4} alignItems="stretch">
        {plans.map(({ id, ...plan }) => (
          <Grid key={id} size={{ xs: 12, sm: 4 }}>
            <PlanCard {...plan} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
