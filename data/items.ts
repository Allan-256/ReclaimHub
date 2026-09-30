export type ItemStatus = "lost" | "found" | "returned";

export type Item = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: ItemStatus;
  image: string;
  postedBy: "admin" | "student";
};

export const items: Item[] = [
  { id: "1", title: "Black iPhone 13", description: "Cracked screen protector, blue case.", location: "Library, 2nd floor", date: "2026-09-28", status: "found", image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80", postedBy: "admin" },
  { id: "2", title: "Student ID Card", description: "Name: A. Nakato. Faculty of Engineering.", location: "Main Gate", date: "2026-09-27", status: "found", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", postedBy: "admin" },
  { id: "3", title: "Silver Wrist Watch", description: "Leather strap, engraved initials on back.", location: "Cafeteria", date: "2026-09-26", status: "lost", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80", postedBy: "student" },
  { id: "4", title: "Blue Backpack", description: "Contains textbooks and a calculator.", location: "Lecture Hall B", date: "2026-09-25", status: "lost", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", postedBy: "admin" },
  { id: "5", title: "HP Laptop Charger", description: "Returned to owner on 2026-09-24.", location: "Computer Lab", date: "2026-09-24", status: "returned", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", postedBy: "admin" },
  { id: "6", title: "Reading Glasses", description: "Brown frame, returned to owner.", location: "Library", date: "2026-09-22", status: "returned", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80", postedBy: "admin" },
  { id: "7", title: "Wireless Earbuds", description: "White case, small scratch on lid.", location: "Bus Park", date: "2026-09-29", status: "found", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", postedBy: "admin" },
  { id: "8", title: "Red Notebook", description: "Contains handwritten chemistry notes.", location: "Science Block", date: "2026-09-23", status: "lost", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80", postedBy: "student" },
];
