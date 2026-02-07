export const NAV_BY_ROLE = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Courses", href: "/courses", icon: "book" },
    { label: "University", href: "/university", icon: "building" },
  ],

  STUDENT: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Courses", href: "/courses", icon: "book" },
  ],

  INSTRUCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Teaching", href: "/teaching", icon: "book" },
  ],

  DATA_ANALYST: [
    { label: "Dashboard", href: "/dashboard", icon: "chart" },
  ],
};
