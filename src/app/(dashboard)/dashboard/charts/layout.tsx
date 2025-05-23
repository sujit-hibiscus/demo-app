"use client";

import type React from "react";

import TabsComponent from "@/components/common/CommonTab";
import { useRedux } from "@/hooks/use-redux";
import type { Tab } from "@/lib/types/dashboardTypes";
import { updateTab } from "@/store/slices/DashboardSlice";

import { ChartTab } from "@/lib/types/chartsTypes";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, FileEdit } from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApiCall } from "@/components/common/ApiCall";

const tabVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
};

export default function ChartLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { selector, dispatch } = useRedux();
    const [currentTab, setCurrentTab] = useState(pathname.split("/").pop() || "pending");
    const { tabs: storedTabs = [] } = selector((state) => state.dashboard);
    const { userType = "", appointmentCounts } = selector((state) => state.user);

    if (!(userType?.toLowerCase()?.includes("admin"))) {
        redirect("/unauthorized");
    }


    const chartsCounts = appointmentCounts?.data?.charts;
    const tabCountLoading = appointmentCounts?.status;
    const { getChartApi } = useApiCall();

    const { pendingDocuments, assignedDocuments, auditDocuments, completedDocuments } = selector((state) => state.documentTable);

    const tabs = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: chartsCounts?.Pending,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: chartsCounts?.Assigned,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: chartsCounts?.Audit,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: chartsCounts?.Completed,
        },
    ];
    const tabsData = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: pendingDocuments?.data?.length,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: assignedDocuments?.data?.length,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: auditDocuments?.data?.length,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: completedDocuments?.data?.length,
        },
    ];



    useEffect(() => {
        setCurrentTab(pathname.split("/").pop() || "pending");
    }, [pathname]);

    const handleTabChange = (value: string) => {
        setCurrentTab(value);
        const targetHref = `/dashboard/charts/${value}`;

        const targetTab = (storedTabs as Tab[])?.map((item) => (item?.active ? { ...item, href: targetHref } : item));

        setTimeout(() => {
            const targetTab = tabsData?.find((item) => item.value === value);
            if (!(targetTab?.count ?? 0 > 0)) {
                getChartApi(value as "pending" | "assigned" | "audit" | "completed");
            }
        });

        dispatch(updateTab(targetTab));
        router.push(targetHref);
    };

    return (
        <div className="px-2 py-1 h-full flex space-y-1 flex-col bg-background">
            <div className="h-10 flex items-center justify-between">
                {userType !== "Provider" && (
                    <div className="flex items-center gap-2">
                        <TabsComponent
                            countLoading={tabCountLoading === "Loading"}
                            tabs={tabs}
                            currentTab={currentTab}
                            handleTabChange={handleTabChange}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTab}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabVariants}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-full overflow-hidden flex flex-col pt-2 pb-1"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
