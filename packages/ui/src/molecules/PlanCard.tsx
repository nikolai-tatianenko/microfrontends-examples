import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useT } from "../i18n";

export interface PlanCardProps {
  name: string;
  /** Monthly price in whole dollars. */
  priceUsd: number;
  features: string[];
  /** Visually emphasize (e.g. the recommended plan). */
  highlighted?: boolean;
  ctaLabel: string;
  ctaTo: string;
}

/** One pricing tier. */
export function PlanCard({
  name,
  priceUsd,
  features,
  highlighted = false,
  ctaLabel,
  ctaTo,
}: PlanCardProps) {
  const t = useT();
  return (
    <Card
      variant={highlighted ? "elevation" : "outlined"}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      data-test-id={`plan-${name.toLowerCase()}`}
    >
      <CardHeader
        title={name}
        slotProps={{
          title: { align: "center", component: "h2", variant: "h5" },
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography component="p" variant="h3" align="center">
          ${priceUsd}
          <Typography component="span" variant="h6" color="text.secondary">
            {t("plan.perMonth")}
          </Typography>
        </Typography>
        <List dense>
          {features.map((feature) => (
            <ListItem key={feature} disableGutters>
              <ListItemText
                primary={feature}
                slotProps={{ primary: { align: "center" } }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant={highlighted ? "contained" : "outlined"}
          component={RouterLink}
          to={ctaTo}
        >
          {ctaLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
