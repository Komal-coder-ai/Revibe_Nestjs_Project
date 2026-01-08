// // "use client";

// // import { useState, useEffect } from 'react';
// // import { useRouter, useParams } from 'next/navigation';
// // import {
// //   Box,
// //   Card,
// //   Avatar,
// //   Typography,
// //   CircularProgress,
// //   Container,
// //   Stack,
// //   Grid,
// //   Tabs,
// //   Tab,
// // } from '@mui/material';
// // import DataTableComponent from '@/app/admin/components/DataTable';
// // import type { TableColumn } from 'react-data-table-component';

// // interface TribeDetail {
// //   id: string;
// //   name: string;
// //   category: string;
// //   createdDate: string;
// //   createdBy: string;
// //   totalMembers: number;
// //   totalPosts: number;
// //   icon: string;
// //   coverImage: string;
// //   isActive: boolean;
// // }

// // export default function TribeDetailPage() {
// //   const router = useRouter();
// //   const params = useParams();
// //   const tribeId = params.id as string;

// //   const [tribeDetails, setTribeDetails] = useState<TribeDetail | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [tabValue, setTabValue] = useState<number>(0);
// //   const [tribeMembers, setTribeMembers] = useState([]);
// //   const [membersLoading, setMembersLoading] = useState(true);

// //   useEffect(() => {
// //     if (tribeId) {
// //       fetchTribeDetails();
// //     }
// //   }, [tribeId]);

// //   useEffect(() => {
// //     if (tabValue === 1 && tribeId) {
// //       fetchTribeMembers();
// //     }
// //   }, [tabValue, tribeId]);

// //   const fetchTribeDetails = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await fetch(`/api/admin/tribe/detail?tribeId=${tribeId}`);
// //       const data = await response.json();

// //       if (data.success && data.data) {
// //         setTribeDetails(data.data);
// //       } else {
// //         console.error('Failed to load tribe details:', data.message);
// //         router.back();
// //       }
// //     } catch (error) {
// //       console.error('Error fetching tribe details:', error);
// //       router.back();
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchTribeMembers = async () => {
// //     try {
// //       setMembersLoading(true);
// //       const response = await fetch(`/api/admin/tribe/members?tribeId=${tribeId}`);
// //       const data = await response.json();

// //       if (data.success && data.data) {
// //         setTribeMembers(data.data);
// //       } else {
// //         console.error('Failed to load tribe members:', data.message);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching tribe members:', error);
// //     } finally {
// //       setMembersLoading(false);
// //     }
// //   };

// //   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
// //     setTabValue(newValue);
// //   };

// //   const memberColumns: TableColumn<any>[] = [
// //     {
// //       name: 'Name',
// //       selector: (row) => row.name,
// //       sortable: true,
// //     },
// //     {
// //       name: 'Role',
// //       selector: (row) => row.role,
// //       sortable: true,
// //     },
// //     {
// //       name: 'Joined Date',
// //       selector: (row) => row.joinedDate,
// //       sortable: true,
// //     },
// //   ];

// //   if (loading) {
// //     return (
// //       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   if (!tribeDetails) {
// //     return null;
// //   }

// //   return (
// //     <Container maxWidth="lg">
// //       <Tabs
// //         value={tabValue}
// //         onChange={handleTabChange}
// //         sx={{ borderBottom: '1px solid #e5e7eb', mb: 3 }}
// //       >
// //         <Tab label="Tribe Details" />
// //         <Tab label="User Options" />
// //       </Tabs>

// //       {tabValue === 0 && (
// //         <>
// //           <Card sx={{ p: 3, mb: 3 }}>
// //             <Grid container spacing={3} alignItems="center">
// //               <Grid item xs={12} sm={3}>
// //                 <Avatar
// //                   src={tribeDetails.icon}
// //                   sx={{ width: 80, height: 80, border: '2px solid #e5e7eb' }}
// //                 />
// //               </Grid>

// //               <Grid item xs={12} sm={9}>
// //                 <Typography variant="h5" fontWeight="bold">
// //                   {tribeDetails.name}
// //                 </Typography>
// //                 {tribeDetails.tribeName && (
// //                   <Typography variant="subtitle1" color="textSecondary">
// //                     Tribe Name: {tribeDetails.tribeName}
// //                   </Typography>
// //                 )}
// //                 <Typography variant="body2" color="textSecondary">
// //                   {tribeDetails.category}
// //                 </Typography>
// //               </Grid>
// //             </Grid>
// //           </Card>

// //           <Card sx={{ p: 3 }}>
// //             <Stack spacing={2}>
// //               <Typography variant="body1">
// //                 <strong>Created By:</strong> {tribeDetails.createdBy}
// //               </Typography>
// //               <Typography variant="body1">
// //                 <strong>Created Date:</strong> {tribeDetails.createdDate}
// //               </Typography>
// //               <Typography variant="body1">
// //                 <strong>Total Members:</strong> {tribeDetails.totalMembers}
// //               </Typography>
// //               <Typography variant="body1">
// //                 <strong>Total Posts:</strong> {tribeDetails.totalPosts}
// //               </Typography>
// //               <Typography variant="body1">
// //                 <strong>Status:</strong> {tribeDetails.isActive ? 'Active' : 'Inactive'}
// //               </Typography>
// //             </Stack>
// //           </Card>
// //         </>
// //       )}

// //       {tabValue === 1 && (
// //         <Card sx={{ p: 3 }}>
// //           {membersLoading ? (
// //             <Typography variant="body1">Loading members...</Typography>
// //           ) : (
// //             <DataTableComponent
// //               title="Tribe Members"
// //               columns={memberColumns}
// //               data={tribeMembers}
// //               pagination
// //               striped
// //               highlightOnHover
// //             />
// //           )}
// //         </Card>
// //       )}
// //     </Container>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import {
//   Box,
//   Card,
//   Avatar,
//   Typography,
//   CircularProgress,
//   Container,
//   Stack,
//   Grid,
//   Tabs,
//   Tab,
// } from "@mui/material";
// import DataTableComponent from "@/app/admin/components/DataTable";
// import type { TableColumn } from "react-data-table-component";

// interface TribeDetail {
//   id: string;
//   name: string;
//   tribeName?: string;
//   category: string;
//   createdDate: string;
//   createdBy: string;
//   totalMembers: number;
//   totalPosts: number;
//   icon: string;
//   coverImage: string;
//   isActive: boolean;
// }

// interface TribeMember {
//   name: string;
//   role: string;
//   joinedDate: string;
// }

// export default function TribeDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const tribeId = params?.id as string;

//   const [tribeDetails, setTribeDetails] = useState<TribeDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [tribeMembers, setTribeMembers] = useState<TribeMember[]>([]);
//   const [membersLoading, setMembersLoading] = useState(false);

//   useEffect(() => {
//     if (tribeId) fetchTribeDetails();
//   }, [tribeId]);

//   useEffect(() => {
//     if (tabValue === 1 && tribeId) fetchTribeMembers();
//   }, [tabValue, tribeId]);

//   const fetchTribeDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/admin/tribe/detail?tribeId=${tribeId}`);
//       const data = await response.json();

//       if (data?.success) {
//         setTribeDetails(data.data);
//       } else {
//         router.back();
//       }
//     } catch (err) {
//       console.error(err);
//       router.back();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTribeMembers = async () => {
//     try {
//       setMembersLoading(true);
//       const res = await fetch(`/api/admin/tribe/members?tribeId=${tribeId}`);
//       const data = await res.json();

//       if (data?.success && Array.isArray(data.data)) {
//         setTribeMembers(data.data);
//       } else {
//         console.error('Failed to fetch tribe members:', data?.message || 'Unknown error');
//         alert('Failed to load tribe members. Please try again later.');
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setMembersLoading(false);
//     }
//   };

//   const handleTabChange = (_: React.SyntheticEvent, value: number) => {
//     setTabValue(value);
//   };

//   const memberColumns: TableColumn<TribeMember>[] = [
//     {
//       name: "Name",
//       selector: (row) => row.name,
//       sortable: true,
//     },
//     {
//       name: "Role",
//       selector: (row) => row.role,
//       sortable: true,
//     },
//     {
//       name: "Joined Date",
//       selector: (row) => row.joinedDate,
//       sortable: true,
//     },
//   ];

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "400px",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!tribeDetails) return null;

//   return (
//     <Container maxWidth="lg">
//       <Tabs
//         value={tabValue}
//         onChange={handleTabChange}
//         sx={{ borderBottom: "1px solid #e5e7eb", mb: 3 }}
//       >
//         <Tab label="Tribe Details" />
//         <Tab label="User Options" />
//       </Tabs>

//       {/* ---------------- Tribe Details Tab ---------------- */}
//       {tabValue === 0 && (
//         <>
//           <Card sx={{ p: 3, mb: 3 }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid item xs={12} sm={3}>
//                 <Avatar
//                   src={tribeDetails.icon}
//                   sx={{ width: 80, height: 80, border: "2px solid #e5e7eb" }}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={9}>
//                 <Typography variant="h5" fontWeight="bold">
//                   {tribeDetails.name}
//                 </Typography>
//                 {tribeDetails.tribeName && (
//                   <Typography variant="subtitle1" color="textSecondary">
//                     Tribe Name: {tribeDetails.tribeName}
//                   </Typography>
//                 )}
//                 <Typography variant="body2" color="textSecondary">
//                   {tribeDetails.category}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Card>

//           {/* <Card sx={{ p: 3, mb: 3 }}>
//             <Typography variant="h6" gutterBottom>
//               Cover Image
//             </Typography>
//             <img
//               src={tribeDetails.coverImage}
//               alt="Cover"
//               style={{
//                 width: "100%",
//                 borderRadius: 8,
//                 border: "1px solid #e5e7eb",
//               }}
//             />
//           </Card> */}

//           <Card sx={{ p: 3 }}>
//             <Stack spacing={1.5}>
//               <Typography>
//                 <strong>Created By:</strong> {tribeDetails.createdBy}
//               </Typography>
//               <Typography>
//                 <strong>Created Date:</strong> {tribeDetails.createdDate}
//               </Typography>
//               <Typography>
//                 <strong>Total Members:</strong> {tribeDetails.totalMembers}
//               </Typography>
//               <Typography>
//                 <strong>Total Posts:</strong> {tribeDetails.totalPosts}
//               </Typography>
//               <Typography>
//                 <strong>Status:</strong>{" "}
//                 {tribeDetails.isActive ? "Active" : "Inactive"}
//               </Typography>
//             </Stack>
//           </Card>
//         </>
//       )}

//       {/* ---------------- Members Tab ---------------- */}
//       {tabValue === 1 && (
//         <Card sx={{ p: 3 }}>
//           {membersLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <DataTableComponent
//               title="Tribe Members"
//               columns={memberColumns}
//               data={tribeMembers}
//               pagination
//               striped
//               highlightOnHover
//             />
//           )}
//         </Card>
//       )}
//     </Container>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Card,
  Avatar,
  Typography,
  CircularProgress,
  Container,
  Stack,
  Tabs,
  Tab,
  Grid
} from "@mui/material";

import DataTableComponent from "@/app/admin/components/DataTable";
import type { TableColumn } from "react-data-table-component";

interface TribeDetail {
  id: string;
  name: string;
  tribeName?: string;
  category: string;
  createdDate: string;
  createdBy: string;
  totalMembers: number;
  totalPosts: number;
  icon: string;
  coverImage: string;
  isActive: boolean;
}

interface TribeMember {
  name: string;
  role: string;
  joinedDate: string;
}

export default function TribeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tribeId = params?.id as string;

  const [tribeDetails, setTribeDetails] = useState<TribeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tribeMembers, setTribeMembers] = useState<TribeMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    if (tribeId) fetchTribeDetails();
  }, [tribeId]);

  useEffect(() => {
    if (tabValue === 1 && tribeId) fetchTribeMembers();
  }, [tabValue, tribeId]);

  const fetchTribeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/tribe/detail?tribeId=${tribeId}`
      );
      const data = await response.json();

      if (data?.success) {
        setTribeDetails(data.data);
      } else {
        router.back();
      }
    } catch (err) {
      console.error(err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchTribeMembers = async () => {
    try {
      setMembersLoading(true);
      const res = await fetch(
        `/api/admin/tribe/members?tribeId=${tribeId}`
      );
      const data = await res.json();

      if (data?.success && Array.isArray(data.data)) {
        setTribeMembers(data.data);
      } else {
        console.error(
          "Failed to fetch tribe members:",
          data?.message || "Unknown error"
        );
        alert("Failed to load tribe members. Please try again later.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  const memberColumns: TableColumn<TribeMember>[] = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "Joined Date",
      selector: (row) => row.joinedDate,
      sortable: true,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!tribeDetails) return null;

  return (
    <Container maxWidth="lg">
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: "1px solid #e5e7eb", mb: 3 }}
      >
        <Tab label="Tribe Details" />
        <Tab label="User Options" />
      </Tabs>

      {/* ---------------- Tribe Details Tab ---------------- */}
      {tabValue === 0 && (
        <>
          
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Avatar
                src={tribeDetails.icon}
                sx={{
                  width: 80,
                  height: 80,
                  border: '2px solid #e5e7eb',
                  flexShrink: 0
                }}
              />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {tribeDetails.name}
                </Typography>
                {tribeDetails.tribeName && (
                  <Typography variant="subtitle1" color="textSecondary">
                    Tribe Name: {tribeDetails.tribeName}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  {tribeDetails.category}
                </Typography>
              </Box>
            </Box>
        

          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography>
                <strong>Created By:</strong> {tribeDetails.createdBy}
              </Typography>
              <Typography>
                <strong>Created Date:</strong> {tribeDetails.createdDate}
              </Typography>
              <Typography>
                <strong>Total Members:</strong> {tribeDetails.totalMembers}
              </Typography>
              <Typography>
                <strong>Total Posts:</strong> {tribeDetails.totalPosts}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                {tribeDetails.isActive ? "Active" : "Inactive"}
              </Typography>
            </Stack>
          </Card>
        </>
      )}

      {/* ---------------- Members Tab ---------------- */}
      {tabValue === 1 && (
        <Card sx={{ p: 3 }}>
          {membersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTableComponent
              title="Tribe Members"
              columns={memberColumns}
              data={tribeMembers}
              pagination
              striped
              highlightOnHover
            />
          )}
        </Card>
      )}
    </Container>
  );
}
