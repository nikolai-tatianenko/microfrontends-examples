import type { ModePreference } from "@blog/tokens/mode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useT, type MessageKey } from "../i18n";

interface ThemeToggleProps {
  /** The visitor's choice: a fixed mode, or "system" to follow the OS. */
  value: ModePreference;
  onChange: (preference: ModePreference) => void;
}

const OPTIONS: readonly {
  value: ModePreference;
  label: MessageKey;
  icon: typeof LightModeIcon;
}[] = [
  { value: "light", label: "theme.light", icon: LightModeIcon },
  { value: "dark", label: "theme.dark", icon: DarkModeIcon },
  { value: "system", label: "theme.system", icon: SettingsBrightnessIcon },
];

/**
 * Light, dark or match-the-system, as one group of toggle buttons. Presentational: the host decides what a
 * change does (the shell stores it and sets the page's mode).
 */
export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const t = useT();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      aria-label={t("theme.label")}
      // An exclusive group reports null when the pressed button is pressed again; the choice stays.
      onChange={(_, next: ModePreference | null) => next && onChange(next)}
    >
      {OPTIONS.map(({ value: option, label, icon: Icon }) => (
        <ToggleButton
          key={option}
          value={option}
          aria-label={t(label)}
          title={t(label)}
          data-test-id={`theme-${option}`}
        >
          <Icon fontSize="small" />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
