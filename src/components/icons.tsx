/**
 * Tokenly's icon set. Every icon in the app comes from here so the look stays consistent.
 *
 * Icons are Phosphor line glyphs ("regular") in a single colour, with the heavier "bold" weight
 * for small UI glyphs (chevrons, close, check, plus) so they stay crisp at 12–16px. Names mirror
 * the lucide names the code already used. Icons belong in navigation, metric cards and buttons
 * (add actions lead with Plus); content headers and list rows stay text-only.
 */
import { forwardRef, type ComponentProps } from "react";
import {
  ArrowCounterClockwise,
  ArrowDown as PhArrowDown,
  ArrowDownLeft as PhArrowDownLeft,
  ArrowDownRight as PhArrowDownRight,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUpRight as PhArrowUpRight,
  ArrowsClockwise,
  ArrowsDownUp,
  Bell as PhBell,
  BellRinging,
  BellSlash,
  BookOpenText,
  CalendarDots,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChartLineUp,
  Check as PhCheck,
  CheckCircle,
  Checks,
  Circle as PhCircle,
  ClockCountdown,
  Command as PhCommand,
  Copy as PhCopy,
  CreditCard as PhCreditCard,
  DotsSixVertical,
  DotsThree,
  DownloadSimple,
  Faders,
  FloppyDisk,
  Gauge as PhGauge,
  GearSix,
  Gift as PhGift,
  Hash as PhHash,
  Info as PhInfo,
  Key,
  Lightning,
  MagnifyingGlass,
  Minus as PhMinus,
  Moon as PhMoon,
  PencilSimple,
  Plus as PhPlus,
  Pulse,
  Question,
  ShieldWarning,
  SidebarSimple,
  SlidersHorizontal as PhSlidersHorizontal,
  SquaresFour,
  Sun as PhSun,
  Trash,
  TrendUp,
  UserPlus as PhUserPlus,
  UsersThree,
  Wallet as PhWallet,
  Warning,
  WarningOctagon,
  WebhooksLogo,
  X as PhX,
  type Icon as PhosphorIcon,
  type IconWeight,
} from "@phosphor-icons/react";

export type IconProps = Omit<ComponentProps<PhosphorIcon>, "ref">;
export type IconComponent = ReturnType<typeof make>;

function make(Glyph: PhosphorIcon, weight: IconWeight) {
  const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Glyph ref={ref} weight={weight} aria-hidden {...props} />
  ));
  Icon.displayName = Glyph.displayName;
  return Icon;
}
const duo = (g: PhosphorIcon) => make(g, "regular");
const bold = (g: PhosphorIcon) => make(g, "bold");

/* Navigation & content: single-weight line icons */
export const LayoutDashboard = duo(SquaresFour);
export const Activity = duo(ChartLineUp);
export const KeyRound = duo(Key);
export const ShieldAlert = duo(ShieldWarning);
export const CreditCard = duo(PhCreditCard);
export const Gauge = duo(Pulse);
export const Settings = duo(GearSix);
export const Settings2 = duo(Faders);
export const SlidersHorizontal = duo(PhSlidersHorizontal);
export const BookOpen = duo(BookOpenText);
export const Bell = duo(PhBell);
export const BellRing = duo(BellRinging);
export const BellOff = duo(BellSlash);
export const CalendarDays = duo(CalendarDots);
export const CalendarClock = duo(ClockCountdown);
export const CircleHelp = duo(Question);
export const CircleCheck = duo(CheckCircle);
export const Info = duo(PhInfo);
export const TriangleAlert = duo(Warning);
export const AlertTriangle = TriangleAlert;
export const OctagonAlert = duo(WarningOctagon);
export const Wallet = duo(PhWallet);
export const Gift = duo(PhGift);
export const Zap = duo(Lightning);
export const Users = duo(UsersThree);
export const UserPlus = duo(PhUserPlus);
export const Webhook = duo(WebhooksLogo);
export const Hash = duo(PhHash);
export const Moon = duo(PhMoon);
export const Sun = duo(PhSun);
export const Copy = duo(PhCopy);
export const Pencil = duo(PencilSimple);
export const Trash2 = duo(Trash);
export const Save = duo(FloppyDisk);
export const Download = duo(DownloadSimple);
export const Search = duo(MagnifyingGlass);
export const TrendingUp = duo(TrendUp);
export const PanelLeft = duo(SidebarSimple);
export const Circle = duo(PhCircle);
export const Command = duo(PhCommand);
export const Speedometer = duo(PhGauge);

/* Small UI glyphs: bold so they read clearly at 12–16px */
export const Check = bold(PhCheck);
export const CheckCheck = bold(Checks);
export const X = bold(PhX);
export const Plus = bold(PhPlus);
export const Minus = bold(PhMinus);
export const ChevronDown = bold(CaretDown);
export const ChevronUp = bold(CaretUp);
export const ChevronLeft = bold(CaretLeft);
export const ChevronRight = bold(CaretRight);
export const ChevronDownIcon = ChevronDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const ArrowRight = bold(PhArrowRight);
export const ArrowLeft = bold(PhArrowLeft);
export const ArrowUpRight = bold(PhArrowUpRight);
export const ArrowDownRight = bold(PhArrowDownRight);
export const ArrowDown = bold(PhArrowDown);
export const ArrowDownLeft = bold(PhArrowDownLeft);
export const ArrowUpDown = bold(ArrowsDownUp);
export const MoreHorizontal = bold(DotsThree);
export const GripVertical = bold(DotsSixVertical);
export const RefreshCw = bold(ArrowsClockwise);
export const RotateCcw = bold(ArrowCounterClockwise);
