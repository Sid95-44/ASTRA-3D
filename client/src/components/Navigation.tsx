/**
 * ASTRA-3D / Orbital Blueprint: the compact command-rail navigation for Complete build workspaces.
 */
import { BookOpen, Compass, Layers3, Radio, Settings2 } from "lucide-react";

type NavigationProps = {
  activeSection: string;
  onNavigate: (section: string) => void;
};

const navigation = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "observation", label: "Observation", icon: Radio },
  { id: "archive", label: "Archive", icon: BookOpen },
  { id: "roadmap", label: "Roadmap", icon: Layers3 },
  { id: "calibration", label: "Calibration", icon: Settings2 },
];

export function Navigation({ activeSection, onNavigate }: NavigationProps) {
  return (
    <nav className="mission-navigation" aria-label="ASTRA mission navigation">
      <p className="rail-label">Station</p>
      {navigation.map(({ id, label, icon: Icon }) => (
        <button key={id} className={activeSection === id ? "is-active" : ""} onClick={() => onNavigate(id)} aria-current={activeSection === id ? "page" : undefined}>
          <Icon size={17} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
