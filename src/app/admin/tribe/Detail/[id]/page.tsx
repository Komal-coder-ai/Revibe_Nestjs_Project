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
  Chip,
  Skeleton,
} from "@mui/material";
import DataTableComponent from "@/app/admin/components/DataTable";
import type { TableColumn } from "react-data-table-component";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Person, TrendingUp } from "@mui/icons-material";

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
      const res = await fetch("/api/admin/tribe/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tribeId, limit: 10, offset: 0 }),
      });
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

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 3 }}>
      <Container maxWidth="lg">
        {loading ? (
          <Stack spacing={3}>
            {/* Header Skeleton */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Skeleton variant="circular" width={80} height={80} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={32} />
                  <Skeleton width="30%" height={20} sx={{ mt: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Skeleton width={70} height={24} />
                    <Skeleton width={70} height={24} />
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Tabs Skeleton */}
            <Card>
              <Box px={4} py={2} display="flex" gap={3}>
                <Skeleton width={140} height={32} />
                <Skeleton width={140} height={32} />
              </Box>

              <Box p={3}>
                <Stack spacing={3} mt={4}>
                  <Skeleton height={200} />
                  <Skeleton height={180} />
                </Stack>
              </Box>
            </Card>
          </Stack>
        ) : tribeDetails ? (
          <Stack spacing={3}>
            {/* ================= HEADER CARD ================= */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 3,
                }}
              >
                {/* LEFT - Avatar and Back Button */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                </Box>

                {/* CENTER - Tribe Info */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {tribeDetails?.tribeName || "-"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {tribeDetails?.description || "-"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Chip
                        label={tribeDetails.isPublic ? "Public" : "Private"}
                        variant="outlined"
                        size="small"
                      />

                      {tribeDetails.isOfficial && (
                        <Chip label="Official" color="primary" size="small" />
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Box>
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
                  value={0}
                />
                <Tab
                  icon={<TrendingUp sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label="Tribe Members"
                  value={1}
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
                        display: "flex",
                        flexWrap: "wrap",
                        gap: { xs: 3, sm: 2 },
                        "& > *": {
                          flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)" },
                          minWidth: 0,
                        },
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
                      borderRadius: 2,
                      mt: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Tribe Rules
                    </Typography>

                    {tribeDetails.rules?.length ? (
                      <Stack spacing={1}>
                        {tribeDetails.rules.map((rule: string, i: number) => (
                          <Typography key={i}>• {rule}</Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Typography>-</Typography>
                    )}
                  </Card>
                </Box>
              )}

              {/* ================= TAB 2 ================= */}
              {tabValue === 1 && (
                <Box p={3}>
                  {membersLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 4,
                      }}
                    >
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
                </Box>
              )}
            </Card>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "500px",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Tribe not found
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}