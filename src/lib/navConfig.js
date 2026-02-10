export const NAV_BY_ROLE = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Users", href: "/users", icon: "users" },
    { label: "Courses", href: "/courses", icon: "book" },
    { label: "University", href: "/university", icon: "building" },
  ],

  STUDENT: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "My Courses", href: "/my-courses", icon: "book" },
    { label: "Courses", href: "/courses", icon: "book" },
    { label: "University", href: "/university", icon: "building" },
  ],

  INSTRUCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Courses", href: "/courses", icon: "book" },
    { label: "Teaching", href: "/teaching", icon: "book" },
    { label: "University", href: "/university", icon: "building" },
  ],

  DATA_ANALYST: [
    { label: "Dashboard", href: "/dashboard", icon: "chart" },
    { label: "University", href: "/university", icon: "building" },
  ],
};
