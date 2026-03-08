import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getAllCountryNames, getStatesForCountry } from "@/lib/latam-locations";

interface LocationSelectorProps {
  country: string;
  state: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  required?: boolean;
}

export const LocationSelector = ({
  country,
  state,
  onCountryChange,
  onStateChange,
  required = false,
}: LocationSelectorProps) => {
  const countries = getAllCountryNames();
  const states = country ? getStatesForCountry(country) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>País {required && "*"}</Label>
        <Select
          value={country}
          onValueChange={(val) => {
            onCountryChange(val);
            onStateChange("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Estado/Provincia {required && "*"}</Label>
        <Select value={state} onValueChange={onStateChange} disabled={!country}>
          <SelectTrigger>
            <SelectValue placeholder={country ? "Selecciona estado" : "Primero selecciona país"} />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
