import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "red" | "blue" | "green" | "purple";
  comingSoon?: boolean;
}

export default function QuickAccessCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  comingSoon = false,
}: QuickAccessCardProps) {
  const colorClasses = {
    red: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      hover: "hover:border-red-300",
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      hover: "hover:border-blue-300",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      hover: "hover:border-green-300",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      hover: "hover:border-purple-300",
    },
  };

  const colors = colorClasses[color];

  const CardContent = () => (
    <div
      className={`relative bg-white rounded-xl border-2 ${colors.border} ${
        comingSoon ? "opacity-70" : `${colors.hover} hover:shadow-lg`
      } p-6 transition-all duration-300 group ${
        comingSoon
          ? "cursor-not-allowed"
          : "cursor-pointer hover:-translate-y-1"
      }`}
    >
      {comingSoon && (
        <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
          Coming Soon
        </div>
      )}

      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
          colors.gradient
        } flex items-center justify-center mb-4 shadow-md ${
          !comingSoon && "group-hover:scale-110"
        } transition-transform`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );

  if (comingSoon) {
    return <CardContent />;
  }

  return (
    <Link href={href}>
      <CardContent />
    </Link>
  );
}
