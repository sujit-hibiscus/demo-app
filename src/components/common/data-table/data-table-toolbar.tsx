"use client";

import type React from "react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import { EndDateFilter, StartDateFilter } from "@/lib/utils";
import { autoAssign } from "@/store/slices/documentManagementSlice";
import { fetchAssignedDocuments, fetchAuditDocuments, fetchPendingDocuments } from "@/store/slices/table-document-slice";
import { clearTabFilters, setTabPagination } from "@/store/slices/tableFiltersSlice";
import type { SortingState, Table } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { LoaderCircle, RefreshCw, Sparkles, X } from "lucide-react";
import { CalendarDateRangePicker } from "./CalendarDateRangePicker";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  dateRange: [Date | null, Date | null]
  loading: boolean
  handleRefresh?: () => void | undefined
  dateKey: string
  setSorting: React.Dispatch<React.SetStateAction<SortingState>> | undefined
  setDateRange: (range: [Date | null, Date | null]) => void
}

function DataTableToolbarComponent<TData>({
  table,
  dateRange,
  loading = false,
  setDateRange,
  setSorting,
  dateKey = "",
  handleRefresh,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { charts = "", target = "" } = useFullPath();
  const tabKey = `${charts}${target}`;
  const { selector, dispatch } = useRedux();
  const storedFilters = selector((state) => state.tableFilters[tabKey]);
  const pageSize = storedFilters?.pagination?.pageSize;
  const pageIndex = storedFilters?.pagination?.pageIndex;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callChartApi = (target: "pending" | "assigned" | "audit" | "completed") => {
    if (target === "pending") {
      dispatch(fetchPendingDocuments());
    } else if (target === "assigned") {
      dispatch(fetchAssignedDocuments());
    } else if (target === "audit") {
      dispatch(fetchAuditDocuments());
    }
  };

  const isChangePage = pageSize ? pageSize !== 25 : false || pageIndex ? pageIndex !== 0 : false;
  const isSort = storedFilters?.sorting;
  const isDateRange = storedFilters?.dateRange[0] !== StartDateFilter && storedFilters?.dateRange[1] !== EndDateFilter;


  // Check if any rows are selected
  const hasSelectedRows = Object.keys(table.getState().rowSelection || {}).length > 0;

  const invisibleColumnCount = table.getAllColumns().filter((column) => !column.getIsVisible()).length;


  const handleResetSorting = () => {
    if (setSorting) {
      setSorting([]);
    }
  };

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
  };

  const handleReset = () => {
    table.resetRowSelection();

    table.resetColumnFilters();
    handleDateRangeChange([StartDateFilter, EndDateFilter],);
    if (invisibleColumnCount > 0) {
      table.getAllColumns().forEach((column) => column.toggleVisibility(true));
    }
    if (isSort?.length > 0) {
      handleResetSorting();
    }

    if (isChangePage) {
      table.setPageSize(25);
      dispatch(
        setTabPagination({
          tabKey: tabKey,
          pagination: {
            pageIndex: 0,
            pageSize: 25,
          },
        }),
      );
    }

    setTimeout(() => {
      dispatch(clearTabFilters(tabKey));
    });
  };

  // Show reset button if any filter is applied, any rows are selected, or any other condition is met
  const showResetButton =
    isFiltered || isDateRange || invisibleColumnCount > 0 || isChangePage || isSort?.length > 0 || hasSelectedRows;

  const { selectedDocumentsId: selectedDocuments } = selector((state) => state.documentTable);

  const getSelectedDocuments = () => {
    if (!selectedDocuments) return [];

    switch (target) {
      case "pending":
        return selectedDocuments.pending || [];
      case "assigned":
        return selectedDocuments.assigned || [];
      case "audit":
        return selectedDocuments.audit || [];
      default:
        return [];
    }
  };

  const selectedDocumentIds = getSelectedDocuments();
  const handleAutoAssign = async () => {
    setIsSubmitting(true);
    const resultAction = await dispatch(autoAssign({ target: target as "pending" | "assigned" | "audit" | "completed", selectedDocumentIds: selectedDocumentIds as string[] }));
    if (autoAssign.fulfilled.match(resultAction)) {
      setIsSubmitting(false);
      handleReset();
      callChartApi(target as "pending" | "assigned" | "audit" | "completed");
    }

  };

  return (
    <div className="flex flex-wrap items-center justify-end w-full lg:w-auto space-x-2">


      <div className="flex items-center gap-1">
        {showResetButton && (
          <Button variant="blue" onClick={() => handleReset()} className="h-8 px-2 lg:px-3">
            <span className="hidden md:inline-block">Reset</span>
            <X className="md:ml-2 h-4 w-4" />
          </Button>
        )}
        {dateKey?.length > 0 && <CalendarDateRangePicker dateRange={dateRange} setDateRange={handleDateRangeChange} />}
      </div>
      {handleRefresh && (
        <Button
          onClick={() => {
            handleRefresh();
          }}
          disabled={loading}
          variant="blue"
          className="h-8 px-2 lg:px-3"
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.8, repeat: loading ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          >
            <RefreshCw className="h-5 w-5" />
          </motion.div>
          Refresh
        </Button>
      )}
      <div className="flex items-center gap-1">
        {/* <DataTableViewOptions table={table} /> */}
        <TasksTableToolbarActions table={table} />
      </div>

      {target !== "completed" && <Button
        onClick={handleAutoAssign}
        disabled={isSubmitting || (!(selectedDocumentIds?.length > 0))}
        className="h-8 px-2 lg:px-3"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Assigning...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Auto Assign
          </>
        )}
      </Button>
      }
    </div>
  );
}

export const DataTableToolbar = memo(DataTableToolbarComponent) as typeof DataTableToolbarComponent;
