"use client";

import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Building,
} from "lucide-react";

const ICONS = {
  home: Home,
  users: Users,
  book: BookOpen,
  graduation: GraduationCap,
  chart: BarChart3,
  building: Building,
};

export default function Icon({ name, ...props }) {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}
