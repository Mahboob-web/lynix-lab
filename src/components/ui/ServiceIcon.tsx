import {
  Bot,
  Camera,
  Cloud,
  CodeXml,
  Film,
  Megaphone,
  MessagesSquare,
  Mic,
  Palette,
  PanelsTopLeft,
  PenTool,
  Share2,
  Smartphone,
  Video,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/types/site";

const icons: Record<IconName, LucideIcon> = {
  camera: Camera,
  video: Video,
  pen: PenTool,
  palette: Palette,
  share: Share2,
  megaphone: Megaphone,
  film: Film,
  layout: PanelsTopLeft,
  code: CodeXml,
  smartphone: Smartphone,
  workflow: Workflow,
  message: MessagesSquare,
  mic: Mic,
  bot: Bot,
  cloud: Cloud,
};

export function ServiceIcon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
