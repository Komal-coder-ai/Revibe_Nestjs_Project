import React, { useMemo } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import SkeletonTable from './SkeletonTable';
import './admin.css';
import { usePathname } from 'next/navigation';


export interface TableAction {
    icon: React.ReactNode;
    label: string;
    onClick: (row: any) => void;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    title?: string;
}

export interface DataTableProps {
    title?: string;
    columns: TableColumn<any>[];
    data: any[];
    actions?: TableAction[];
    searchPlaceholder?: string;
    onSearch?: (searchTerm: string) => void;
    onPageChange?: (page: number) => void;
    sortable?: boolean;
    pagination?: boolean;
    striped?: boolean;
    highlightOnHover?: boolean;
    dense?: boolean;
    loading?: boolean;
    noDataComponent?: React.ReactNode;
    customStyles?: any;
    paginationServerMode?: boolean;
    paginationDefaultPage?: number;
    paginationTotalRows?: number;
}

const customStyles = {
    header: {
        style: {
            padding: '16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
        },
    },
    headRow: {
        style: {
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            minHeight: '52px',
        },
    },
    headCells: {
        style: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    rows: {
        style: {
            minHeight: '52px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f3f4f6',
            transition: 'background-color 0.2s ease',
            '&:hover': {
                backgroundColor: '#f9fafb',
            },
        },
        stripedStyle: {
            backgroundColor: '#f9fafb',
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
            color: '#374151',
        },
    },

};

const getColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
        blue: 'text-blue-600 hover:bg-blue-50',
        green: 'text-green-600 hover:bg-green-50',
        red: 'text-red-600 hover:bg-red-50',
        yellow: 'text-yellow-600 hover:bg-yellow-50',
        purple: 'text-purple-600 hover:bg-purple-50',
    };
    return colorMap[color || 'blue'] || colorMap.blue;
};

const DataTableComponent: React.FC<DataTableProps> = ({
    title,
    columns,
    data,
    actions,
    searchPlaceholder = 'Search...',
    onSearch,
    onPageChange,
    sortable = true,
    pagination = true,
    striped = true,
    highlightOnHover = true,
    dense = false,
    loading = false,
    noDataComponent,
    customStyles: customStylesOverride,
    paginationServerMode = false,
    paginationDefaultPage = 1,
    paginationTotalRows = 0,
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const pathname = usePathname();

    const isUserDetailPage = /^\/admin\/users\/Detail\/[^/]+$/.test(pathname);

    console.log(isUserDetailPage, "isUserDetailPageisUserDetailPageisUserDetailPage")

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        if (paginationServerMode) return data; // Don't filter on client if server-side pagination is enabled

        return data.filter((row) => {
            return Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [data, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch?.(term);
    };

    // Add actions column if actions are provided
    const finalColumns = actions
        ? [
            ...columns,
            {
                name: 'Actions',
                cell: (row: any) => (
                    <div className="flex gap-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => action.onClick(row)}
                                className={`p-2 rounded-lg transition-colors ${getColorClass(action.color)}`}
                                title={action.title || action.label}
                            >
                                {action.icon}
                            </button>
                        ))}
                    </div>
                ),
                sortable: false,
                width: '120px',
            } as TableColumn<any>,
        ]
        : columns;

    return (
        <>

            {isUserDetailPage ?



                <div>


                    <div className="p-6">
                        {searchPlaceholder && (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full md:w-64"
                                />
                            </div>
                        )}

                        {loading ? (
                            <SkeletonTable columns={finalColumns.length} rows={10} />
                        ) : (
                            <DataTable
                                columns={finalColumns}
                                data={filteredData}
                                pagination={pagination}
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                paginationServer={paginationServerMode}
                                paginationDefaultPage={paginationDefaultPage}
                                paginationTotalRows={paginationTotalRows}
                                onChangePage={onPageChange}
                                striped={striped}
                                highlightOnHover={highlightOnHover}
                                noDataComponent={
                                    noDataComponent || (
                                        <div className="py-8 text-center text-gray-500">
                                            No data found
                                        </div>
                                    )
                                }
                                customStyles={{ ...customStyles, ...customStylesOverride }}
                            />
                        )}
                    </div>
                </div>

                :

                <div className="bg-white rounded-lg shadow">
                    {title && (
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        </div>
                    )}

                    <div className="p-6">
                        {searchPlaceholder && (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full md:w-64"
                                />
                            </div>
                        )}

                        {loading ? (
                            <SkeletonTable columns={finalColumns.length} rows={10} />
                        ) : (
                            <DataTable
                                columns={finalColumns}
                                data={filteredData}
                                pagination={pagination}
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                paginationServer={paginationServerMode}
                                paginationDefaultPage={paginationDefaultPage}
                                paginationTotalRows={paginationTotalRows}
                                onChangePage={onPageChange}
                                striped={striped}
                                highlightOnHover={highlightOnHover}
                                noDataComponent={
                                    noDataComponent || (
                                        <div className="py-8 text-center text-gray-500">
                                            No data found
                                        </div>
                                    )
                                }
                                customStyles={{ ...customStyles, ...customStylesOverride }}
                            />
                        )}
                    </div>
                </div>

            }
        </>
    );
};

export default DataTableComponent;
