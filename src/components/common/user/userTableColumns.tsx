"use client";

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { StatusFilter } from "@/components/previsit/AppointmentStatusHeaderFilter";
import { StatusBadge } from "@/components/previsit/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserTypes, USERTYPES } from "@/lib/types/PrevisitTypes";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

interface PrevisitActionHandlers {
    onDelete: (chartId: string) => void
    onEdit: (chartId: string) => void
}

export const UserTableColumns = (
    actionHandlers: PrevisitActionHandlers,
): (ColumnDef<UserTypes> & { isDragable?: boolean })[] => {
    return [
        {
            isDragable: false,
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="ID" />,
            cell: ({ row }) => {
                const chartId = row?.original?.id;
                return <div className="min-w-[3rem] cursor-default truncate">{+chartId}</div>;
            },
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            },
            sortingFn: (rowA, rowB, columnId) => {
                const valueA = rowA.getValue(columnId) as number;
                const valueB = rowB.getValue(columnId) as number;

                return valueA - valueB;
            },
            enableSorting: true,
            enableHiding: false,
        },

        {
            accessorKey: "Fname",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="First Name" />,
            cell: ({ row }) => {
                const firstName = row?.original?.Fname || "";
                const fullName = `${firstName}`.trim();
                return (
                    <div
                        className="min-w-[5rem]  w-full cursor-pointer truncate"
                    >
                        {fullName}
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                const firstName = String(row.original.Fname || "").toLowerCase();

                const fullName = `${firstName}`.trim();
                const filterValue = String(value)?.trim().toLowerCase();

                return fullName.includes(filterValue);
            },
            sortingFn: (rowA, rowB) => {
                const rowAName = `${rowA.original.Fname}`.trim();
                const rowBName = `${rowB.original.Fname}`.trim();

                return rowAName.localeCompare(rowBName);
            }
        },
        {
            accessorKey: "LName",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Last Name" />,
            cell: ({ row }) => {
                const lastName = row?.original?.Lname || "";
                const fullName = `${lastName}`.trim();
                return (
                    <div
                        className="min-w-[5rem]  w-full cursor-pointer truncate"
                    >
                        {fullName}
                    </div>
                );
            },
            isDragable: true,
            filterFn: (row, id, value) => {
                const firstName = String(row.original.Lname || "").toLowerCase();

                const fullName = `${firstName}`.trim();
                const filterValue = String(value)?.trim().toLowerCase();

                return fullName.includes(filterValue);
            },
            sortingFn: (rowA, rowB) => {
                const rowAName = `${rowA.original.Lname}`.trim();
                const rowBName = `${rowB.original.Lname}`.trim();

                return rowAName.localeCompare(rowBName);
            }
        },
        {
            accessorKey: "email",
            header: ({ column }) => <DataTableColumnHeader searchType={"date"} column={column} title="Email" />,
            cell: ({ row }) => (
                <div className="min-w-[4.25rem] truncate">
                    <span className="lowercase"> {row.getValue("email")}</span>
                </div>
            ),
            isDragable: true,
        },
        /* custom status */
        {
            isDragable: true,
            accessorKey: "profile_type",
            header: ({ column }) => <StatusFilter column={column} title="UserType" statusEnum={USERTYPES} />,
            cell: ({ row }) => {
                const status: USERTYPES = row.getValue("profile_type") !== "Provider" ? USERTYPES.ANALYST : USERTYPES.PROVIDER;
                return (
                    <div className="min-w-[4.25rem] max-w-[6rem] whitespace-nowrap">
                        <StatusBadge status={status} />
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "action",
            enableSorting: false,
            enableHiding: true,
            isDragable: false,
            header: () => (
                <div className=" w-full flex justify-center">
                    <button>Action</button>
                    {/* <DataTableColumnHeader column={column} title="Action" /> */}
                </div>
            ),
            cell: ({ row }) => {
                const chartId = row?.original?.id;

                return (
                    <div className="flex items-center justify-end gap-1 min-w-[5rem]">
                        <TooltipProvider>
                            {/* Edit */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-selectedText hover:text-tabBg animate-smooth"
                                        onClick={() => actionHandlers.onEdit(`${chartId}`)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-red-500 hover:text-white animate-smooth"
                                        onClick={() => actionHandlers.onDelete(`${chartId}`)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        }

    ];
};

