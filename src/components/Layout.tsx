

import React from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const getHeaderTitle = (path) => {
    switch (path) {
  
      case '/dashboard': // For the root path, if it also maps to dashboard
        return 'Dashboard Overview';
      case '/admissions':
        return 'Admissions';
      case '/patients':
        return 'Patients';
      case '/admission/:id':
        return 'Admission Management';
      default:
        return 'Welcome';
    }
  };

  const headerTitle = getHeaderTitle(currentPath);
  return (
    <div className="min-h-screen font-sans bg-[#f6fbfd]">
       <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
              </div>
               <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    {/* <BreadcrumbLink href="#"> */}
                      <h1 className="text-primary-500 font-medium text-lg mt-2">{headerTitle}</h1>
                    {/* </BreadcrumbLink> */}
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
    </div>
  );
}