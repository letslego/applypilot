import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MatchBadge({
  score,
  className,
}: {
  score: number | null | undefined;
  className?: string;
}) {
  if (score == null) {
    return (
      <Badge className={cn("bg-stone-100 text-stone-600", className)}>
        No match yet
      </Badge>
    );
  }

  const tone =
    score >= 80
      ? "bg-teal-800 text-sand-50"
      : score >= 60
        ? "bg-teal-100 text-teal-900"
        : score >= 40
          ? "bg-amber-100 text-amber-900"
          : "bg-stone-200 text-stone-700";

  return (
    <Badge className={cn(tone, className)}>
      {score}% match
    </Badge>
  );
}
