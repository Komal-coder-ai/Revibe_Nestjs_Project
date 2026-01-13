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
// <DataTableComponent
//   title="Tribe Members"
//   columns={memberColumns}
//   data={tribeMembers}
//   pagination
//   striped
//   highlightOnHover
// />
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
  Grid,
  Chip,
  Skeleton
} from "@mui/material";

import DataTableComponent from "@/app/admin/components/DataTable";
import type { TableColumn } from "react-data-table-component";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Person, TrendingUp } from "@mui/icons-material";
import AdminFeedPage from "@/app/admin/Feed/page";

interface TribeDetail {
  id: string;
  tribeName: string;
  description?: string;
  category: string;
  categoryName?: string;
  icon?: Array<{ thumbUrl?: string; imageUrl?: string }>;
  bannerImage?: Array<{ thumbUrl?: string; imageUrl?: string }>;
  rules?: string[];
  isPublic?: boolean;
  isOfficial?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

interface TribeMember {
  name: string;
  role: string;
  joinedDate: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
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
      const res = await fetch('/api/admin/tribe/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tribeId, limit: 10, offset: 0 }),
      });
      const data = await res.json();

      if (data?.success && Array.isArray(data.data)) {
        setTribeMembers(data.data);
      } else {
        console.error(
          'Failed to fetch tribe members:',
          data?.message || 'Unknown error'
        );
        alert('Failed to load tribe members. Please try again later.');
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
      name: "id",
      selector: (row) => row.id,
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


  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  return (

    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 3 }}>
      <Container maxWidth="lg">
        {loading ? (
          <Stack spacing={3}>
            {/* Header Skeleton */}
            <Card sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Skeleton variant="circular" width={80} height={80} />
                </Grid>
                <Grid item xs>
                  <Skeleton width="40%" height={32} />
                  <Skeleton width="30%" height={20} />
                  <Stack direction="row" spacing={1} mt={1}>
                    <Skeleton width={70} height={24} />
                    <Skeleton width={70} height={24} />
                  </Stack>
                </Grid>
                <Grid item>
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={20} />
                </Grid>
              </Grid>
            </Card>

            {/* Tabs Skeleton */}
            <Card>
              <Box px={4} py={2} display="flex" gap={3}>
                <Skeleton width={140} height={32} />
                <Skeleton width={140} height={32} />
              </Box>

              <Box p={3}>
                {/* Stats Skeleton */}
                {/* <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Skeleton height={120} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton height={120} />
              </Grid>
            </Grid> */}

                {/* Info Cards Skeleton */}
                <Stack spacing={3} mt={4}>
                  <Skeleton height={200} />
                  <Skeleton height={180} />
                </Stack>
              </Box>
            </Card>
          </Stack>
        ) : tribeDetails ? (
          <>
            <Stack spacing={3}>
              {/* ================= HEADER CARD ================= */}
              <Card sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* LEFT */}
                  <Grid item xs={12} sm="auto">
                    <Stack direction="row" spacing={2}>
                      <KeyboardArrowLeftIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => router.back()}
                      />

                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          fontSize: "2rem",
                          fontWeight: "bold",
                        }}
                        src={tribeDetails?.icon?.[0]?.imageUrl}
                      >
                        {tribeDetails?.tribeName
                          ? tribeDetails.tribeName.charAt(0).toUpperCase()
                          : "?"}
                      </Avatar>
                    </Stack>
                  </Grid>

                  {/* CENTER */}
                  <Grid item xs>
                    <Stack spacing={0.5}>
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {tribeDetails?.tribeName || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {tribeDetails?.description || "-"}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={tribeDetails.isPublic ? "Public" : "Private"}
                          variant="outlined"
                          size="small"
                        />

                        {tribeDetails.isOfficial && (
                          <Chip label="Official" color="primary" size="small" />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* RIGHT */}
                  {/* <Grid item sx={{ ml: "auto" }}>
                  <Stack alignItems="flex-end">
                    <Typography variant="caption" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {formatDate(tribeDetails.createdAt)}
                    </Typography>
                  </Stack>
                </Grid> */}
                </Grid>
              </Card>

              {/* ================= TABS ================= */}
              <Card>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: "2px solid #f0f0f0",
                    px: 4,
                    backgroundColor: "#fafbfc",
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#718096",
                      py: 2,
                      mr: 3,
                    },
                    "& .MuiTab-root.Mui-selected": {
                      color: "#667eea",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#667eea",
                      height: 3,
                    },
                  }}
                >
                  <Tab
                    icon={<Person sx={{ mr: 1 }} />}
                    iconPosition="start"
                    label="Tribe Details"
                  />
                  <Tab
                    icon={<TrendingUp sx={{ mr: 1 }} />}
                    iconPosition="start"
                    label="Tribe Members"
                  />
                </Tabs>

                {/* ================= TAB 1 ================= */}
                {tabValue === 0 && (
                  <Box p={3}>
                    <Card
                      sx={{
                        p: 3,
                        bgcolor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Information
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 2,
                        }}
                      >
                        {[
                          {
                            label: "Category",
                            value: tribeDetails.categoryName,
                          },
                          {
                            label: "Public",
                            value: tribeDetails.isPublic ? "Yes" : "No",
                          },
                          {
                            label: "Official",
                            value: tribeDetails.isOfficial ? "Yes" : "No",
                          },
                          {
                            label: "Created Date",
                            value: formatDate(tribeDetails.createdAt),
                          },
                        ].map((field, idx) => (
                          <Box key={idx}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, color: "#525252" }}
                            >
                              {field.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 0.5, fontWeight: 500 }}
                            >
                              {field.value || "-"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                    <Card
                      sx={{
                        p: 3,
                        bgcolor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 2, mt: 3
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Tribe Rules
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 2,
                        }}
                      >
                        {tribeDetails.rules?.length ? (
                          <Stack spacing={1}>
                            {tribeDetails.rules.map((rule: string, i: number) => (
                              <Typography key={i}>• {rule}</Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography>-</Typography>
                        )}
                      </Box>
                    </Card>
                  </Box>
                )}

                {/* ================= TAB 2 ================= */}
                {tabValue === 1 && (
                  <Box p={3}>
                    <DataTableComponent
                      title="Tribe Members"
                      columns={memberColumns}
                      data={tribeMembers}
                      pagination
                      striped
                      highlightOnHover
                    />
                  </Box>
                )}
              </Card>
            </Stack>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
            <Typography variant="h6" color="textSecondary">
              User not found
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
