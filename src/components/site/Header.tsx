import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, ShoppingCart, User as UserIcon, Sun, Moon, LogOut, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/account", label: "Orders" },
  { to: "/reservations", label: "Reservations" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            Kabab <span className="text-primary">Jee</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><UserIcon className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/account">My Orders</Link></DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}

          {/* Mobile nav trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-l border-border/60 bg-background/95 backdrop-blur p-0">
              <div className="flex items-center gap-2 px-6 py-5 border-b border-border/60">
                <Flame className="h-5 w-5 text-primary" />
                <span className="text-base font-bold tracking-tight">
                  Kabab <span className="text-primary">Jee</span>
                </span>
              </div>
              <nav className="flex flex-col px-3 py-4">
                {links.map((l, i) => {
                  const active = pathname === l.to;
                  return (
                    <SheetClose asChild key={l.to}>
                      <Link
                        to={l.to}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-right-4 fill-mode-both ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <span>{l.label}</span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            active ? "bg-primary scale-100" : "bg-transparent scale-0 group-hover:bg-primary/60 group-hover:scale-100"
                          }`}
                        />
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}