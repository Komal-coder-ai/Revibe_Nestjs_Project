'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
} from '@mui/material';

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
}

export default function SkeletonTable({ columns = 8, rows = 10 }: SkeletonTableProps) {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell
                key={`header-${index}`}
                sx={{
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <Skeleton variant="text" width="80%" height={20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow
              key={`row-${rowIndex}`}
              sx={{
                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                borderBottom: '1px solid #f3f4f6',
                '&:hover': {
                  backgroundColor: rowIndex % 2 === 0 ? '#f9fafb' : '#f9fafb',
                },
              }}
            >
              {Array.from({ length: columns }).map((_, cellIndex) => (
                <TableCell
                  key={`cell-${rowIndex}-${cellIndex}`}
                  sx={{
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  {cellIndex === 0 ? (
                    // For ID column - shorter skeleton
                    <Skeleton variant="text" width="60%" height={20} />
                  ) : cellIndex === 4 ? (
                    // For Profile Image column - circular skeleton
                    <Skeleton variant="circular" width={40} height={40} />
                  ) : cellIndex === columns - 1 ? (
                    // For Status column - smaller skeleton
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: '4px' }} />
                    </Box>
                  ) : (
                    // Default text skeleton
                    <Skeleton variant="text" width="85%" height={20} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
