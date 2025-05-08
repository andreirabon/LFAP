"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LeaveRequestContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-2">
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/personal-information"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Personal Information</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View and update your personal information.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild></NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/file-leave"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">File Leave</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Initiate and submit a new leave application.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/view-leave-balances"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">View Leave Balances</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View your current leave balances for various leave types.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/track-status"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Track status of leave request</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Monitor the current status and history of your submitted leave applications.
            </p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

const ReportsContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-2">
        <NavigationMenuLink asChild>
          <Link
            href="/reports-and-logs/leave-history-report"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Leave History Report</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">View your leave history report.</p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/reports-and-logs/monthly-leave-util-report"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Monthly Leave Utilization Reports</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View your monthly leave utilization reports.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/reports-and-logs/approval-logs"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Approval Logs</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">View your approval logs.</p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

const EndorsementsContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-4">
        <NavigationMenuLink asChild>
          <Link
            href="/endorse/team-calendar"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">View Team Calendar</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View your team&apos;s leave schedule.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/endorse/endorse-leave-request"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Endorse Leave Request</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Endorse leave requests from your team.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/endorse/view-leave-balances"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">View Leave Balances of Subordinates</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View leave balances of your subordinates.
            </p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

const ApprovalsContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-4">
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/pending-approvals"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Pending Approvals</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">View all pending approvals.</p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/approved-approvals"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Approved Approvals</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">View all approved approvals.</p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/rejected-approvals"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Rejected Approvals</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">View all rejected approvals.</p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

export default function NavigationBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name: string;
    role: "Employee" | "Manager" | "HR Admin" | "Top Management" | "Super Admin";
    avatar: string | null;
    isLoggedIn: boolean;
  }>({
    name: "",
    role: "Employee",
    avatar: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();

        if (data.isLoggedIn) {
          setUser({
            name: `${data.firstName} ${data.lastName}`,
            role: data.role as "Employee" | "Manager" | "HR Admin" | "Top Management" | "Super Admin",
            avatar: null,
            isLoggedIn: true,
          });
        } else {
          setUser({
            name: "",
            role: "Employee",
            avatar: null,
            isLoggedIn: false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUser({
          name: "",
          role: "Employee",
          avatar: null,
          isLoggedIn: false,
        });
      }
    };

    fetchSession();
  }, [pathname]);

  // Hide navigation bar on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center">
        {/* Logo/Brand */}
        <Link
          href="/"
          className="mr-4 flex items-center space-x-2 font-semibold min-w-fit">
          <Image
            src="/dostlogo.ico"
            alt="Company Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
          <span className="text-md hidden sm:inline">Leave Filing and Approval Process</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-start md:ml-2">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {(user.role === "Employee" || user.role === "Super Admin") && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "text-xs lg:text-sm px-2",
                      pathname.startsWith("/leave-request")
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}>
                    Leave Request
                  </NavigationMenuTrigger>
                  <LeaveRequestContent />
                </NavigationMenuItem>
              )}

              {(user.role === "Manager" || user.role === "Super Admin") && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "text-xs lg:text-sm px-2",
                      pathname.startsWith("/endorse") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}>
                    Endorsements
                  </NavigationMenuTrigger>
                  <EndorsementsContent />
                </NavigationMenuItem>
              )}

              {(user.role === "HR Admin" || user.role === "Super Admin") && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/leave-balance-management"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-xs lg:text-sm px-2",
                          pathname === "/leave-balance-management"
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground",
                        )}>
                        Leave Balance
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        "text-xs lg:text-sm px-2",
                        pathname.startsWith("/reports") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      )}>
                      Reports
                    </NavigationMenuTrigger>
                    <ReportsContent />
                  </NavigationMenuItem>
                </>
              )}

              {(user.role === "Top Management" || user.role === "Super Admin") && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "text-xs lg:text-sm px-2",
                      pathname.startsWith("/approvals") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}>
                    Approvals
                  </NavigationMenuTrigger>
                  <ApprovalsContent />
                </NavigationMenuItem>
              )}

              {user.role === "Super Admin" ? (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/audit-trail"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-xs lg:text-sm px-2",
                          pathname === "/audit-trail" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                        )}>
                        Audit
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              ) : (
                user.role !== "Employee" &&
                user.role !== "Manager" &&
                user.role !== "HR Admin" &&
                user.role !== "Top Management" && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        className={cn(
                          "text-xs lg:text-sm px-2",
                          pathname.startsWith("/reports")
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground",
                        )}>
                        Reports
                      </NavigationMenuTrigger>
                      <ReportsContent />
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/audit-trail"
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "text-xs lg:text-sm px-2",
                            pathname === "/audit-trail" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          )}>
                          Audit
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User Profile Dropdown */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {user.isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/api/auth/logout"
                    className="w-full flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Leave Request Section */}
                {(user.role === "Employee" || user.role === "Super Admin") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Leave Request</h3>
                    <div className="pl-2 space-y-2 flex flex-col">
                      <Link
                        href="/leave-request/personal-information"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/leave-request/personal-information" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Personal Information
                      </Link>
                      <Link
                        href="/leave-request/file-leave"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/leave-request/file-leave" ? "text-primary" : "text-muted-foreground",
                        )}>
                        File Leave
                      </Link>
                      <Link
                        href="/leave-request/view-leave-balances"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/leave-request/view-leave-balances" ? "text-primary" : "text-muted-foreground",
                        )}>
                        View Leave Balances
                      </Link>
                      <Link
                        href="/leave-request/track-status"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/leave-request/track-status" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Track Status
                      </Link>
                    </div>
                  </div>
                )}

                {(user.role === "Manager" || user.role === "Super Admin") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Endorsements</h3>
                    <div className="pl-2 space-y-2 flex flex-col">
                      <Link
                        href="/endorse/team-calendar"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/endorse/team-calendar" ? "text-primary" : "text-muted-foreground",
                        )}>
                        View Team Calendar
                      </Link>
                      <Link
                        href="/endorse/endorse-leave-request"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/endorse/endorse-leave-request" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Endorse Leave Request
                      </Link>
                      <Link
                        href="/endorse/view-leave-balances"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/endorse/view-leave-balances" ? "text-primary" : "text-muted-foreground",
                        )}>
                        View Leave Balances
                      </Link>
                    </div>
                  </div>
                )}

                {(user.role === "HR Admin" || user.role === "Super Admin") && (
                  <>
                    <Link
                      href="/leave-balance-management"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === "/leave-balance-management" ? "text-primary" : "text-muted-foreground",
                      )}>
                      Leave Balance Management
                    </Link>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Reports & Logs</h3>
                      <div className="pl-2 space-y-2 flex flex-col">
                        <Link
                          href="/reports-and-logs/leave-history-report"
                          className={cn(
                            "text-sm transition-colors hover:text-primary",
                            pathname === "/reports-and-logs/leave-history-report"
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}>
                          Leave History Report
                        </Link>
                        <Link
                          href="/reports-and-logs/monthly-leave-util-report"
                          className={cn(
                            "text-sm transition-colors hover:text-primary",
                            pathname === "/reports-and-logs/monthly-leave-util-report"
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}>
                          Monthly Leave Utilization
                        </Link>
                        <Link
                          href="/reports-and-logs/approval-logs"
                          className={cn(
                            "text-sm transition-colors hover:text-primary",
                            pathname === "/reports-and-logs/approval-logs" ? "text-primary" : "text-muted-foreground",
                          )}>
                          Approval Logs
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {(user.role === "Top Management" || user.role === "Super Admin") && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Approvals</h3>
                    <div className="pl-2 space-y-2 flex flex-col">
                      <Link
                        href="/approvals/pending-approvals"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/approvals/pending-approvals" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Pending Approvals
                      </Link>
                      <Link
                        href="/approvals/approved-approvals"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/approvals/approved-approvals" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Approved Approvals
                      </Link>
                      <Link
                        href="/approvals/rejected-approvals"
                        className={cn(
                          "text-sm transition-colors hover:text-primary",
                          pathname === "/approvals/rejected-approvals" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Rejected Approvals
                      </Link>
                    </div>
                  </div>
                )}

                {user.role === "Super Admin" ? (
                  <>
                    {/* Audit Trail */}
                    <Link
                      href="/audit-trail"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === "/audit-trail" ? "text-primary" : "text-muted-foreground",
                      )}>
                      Audit Trail
                    </Link>
                  </>
                ) : (
                  user.role !== "Employee" &&
                  user.role !== "Manager" &&
                  user.role !== "HR Admin" &&
                  user.role !== "Top Management" && (
                    <>
                      {/* Audit Trail */}
                      <Link
                        href="/audit-trail"
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === "/audit-trail" ? "text-primary" : "text-muted-foreground",
                        )}>
                        Audit Trail
                      </Link>
                    </>
                  )
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex flex-col space-y-1 mb-4">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    asChild>
                    <Link href="/api/auth/logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
