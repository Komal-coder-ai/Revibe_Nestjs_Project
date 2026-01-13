'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Button,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Container,
  Stack,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  ShoppingBag,
  Star,
  ShoppingCart,
  Info,
  Login,
  Person,
  EditNote,
  Email,
  Phone,
  Notes,
  Badge,
  Lock,
  BarChart,
  Bolt,
  CalendarToday,
  CheckCircle,
  People,
  CardGiftcard,
  TrendingUp,
  AccessTime,
  PeopleAlt,
} from '@mui/icons-material';
import AdminFeedPage from '@/app/admin/Feed/page';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

interface UserDetail {
  id: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  countryCode: string;
  bio: string;
  aadhar: string;
  profileImage: string;
  coverImage: string;
  profileType: string;
  isVerified: boolean;
  status: number;
  userType: string;
  referralCode: string;
  createdAt: string;
  joinedDate: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
}

interface Feed {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
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

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [tabValue, setTabValue] = useState<number>(0);
  const [userDetails, setUserDetails] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching user details for ID:', userId);

      const response = await fetch(`/api/admin/user/detail?userId=${userId}`);
      const data = await response.json();

      console.log('User detail API response:', data);

      if (data.success && data.data) {
        setUserDetails(data.data);
      } else {
        toast.error(data.message || 'Failed to load user details');
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      setTimeout(() => router.back(), 1500);
    } finally {
      setLoading(false);
    }
  };

  const feeds: Feed[] = [
    {
      id: '1',
      type: 'Order',
      description: 'Placed order #ORD-001 for $299.99',
      timestamp: '2024-12-29 10:30',
      status: 'Completed',
    },
    {
      id: '2',
      type: 'Review',
      description: 'Left a 5-star review on product "Premium Headphones"',
      timestamp: '2024-12-28 15:45',
      status: 'Completed',
    },
    {
      id: '3',
      type: 'Purchase',
      description: 'Purchased item "Wireless Mouse" for $49.99',
      timestamp: '2024-12-25 09:20',
      status: 'Completed',
    },
    {
      id: '4',
      type: 'Account',
      description: 'Updated profile information',
      timestamp: '2024-12-20 11:00',
      status: 'Completed',
    },
    {
      id: '5',
      type: 'Login',
      description: 'Logged in from Chrome on Windows',
      timestamp: '2024-12-30 14:30',
      status: 'Active',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Order':
        return <ShoppingBag sx={{ fontSize: 20 }} />;
      case 'Review':
        return <Star sx={{ fontSize: 20 }} />;
      case 'Purchase':
        return <ShoppingCart sx={{ fontSize: 20 }} />;
      case 'Account':
        return <Info sx={{ fontSize: 20 }} />;
      case 'Login':
        return <Login sx={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 3 }}>
      <Container maxWidth="lg">
        {loading ? (
          <Stack spacing={3}>
            {/* Header Skeleton */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={80} height={80} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={32} />
                  <Skeleton width="30%" height={20} sx={{ mt: 1 }} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton width={70} height={24} />
                    <Skeleton width={70} height={24} />
                  </Box>
                </Box>
                <Box>
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={20} />
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
        ) : userDetails ? (
          <>
            <Stack spacing={3}>
              {/* Header Card */}
              <Card sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 3,
                  }}
                >
                  {/* LEFT: Back + Avatar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <KeyboardArrowLeftIcon 
                      sx={{ cursor: 'pointer' }} 
                      onClick={() => router.back()} 
                    />
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                      }}
                      src={userDetails.profileImage}
                    >
                      {userDetails.name && userDetails.name !== 'N/A'
                        ? userDetails.name.charAt(0).toUpperCase()
                        : '?'}
                    </Avatar>
                  </Box>

                  {/* CENTER: User Info */}
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {userDetails.name && userDetails.name !== 'N/A'
                          ? userDetails.name
                          : '-'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {userDetails.username && userDetails.username !== 'N/A'
                          ? userDetails.username
                          : '-'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={userDetails.status === 1 ? 'Active' : 'Inactive'}
                          color={userDetails.status === 1 ? 'success' : 'error'}
                          size="small"
                        />
                        <Chip
                          label={userDetails.profileType === 'public' ? 'Public' : 'Private'}
                          variant="outlined"
                          size="small"
                        />
                        {userDetails.isVerified && (
                          <Chip label="✓ Verified" color="warning" size="small" />
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* RIGHT: Member Since */}
                  <Box>
                    <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <Typography variant="caption" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {userDetails.joinedDate || '-'}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Card>

              {/* Tabs Card */}
              <Card>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: '2px solid #f0f0f0',
                    px: 4,
                    backgroundColor: '#fafbfc',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#718096',
                      py: 2,
                      minWidth: 'auto',
                      mr: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#667eea',
                      },
                    },
                    '& .MuiTab-root.Mui-selected': {
                      color: '#667eea',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#667eea',
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  <Tab 
                    icon={<Person sx={{ mr: 1 }} />} 
                    iconPosition="start" 
                    label="Profile Details" 
                    id="tab-0" 
                    aria-controls="tabpanel-0" 
                  />
                  <Tab 
                    icon={<TrendingUp sx={{ mr: 1 }} />} 
                    iconPosition="start" 
                    label="Activity Feed" 
                    id="tab-1" 
                    aria-controls="tabpanel-1" 
                  />
                </Tabs>

                {/* Profile Details Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Stack spacing={4}>
                    {/* Social Information */}
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <PeopleAlt sx={{ color: 'black', fontSize: '1.5rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>
                          Social Information
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 2,
                          '& > *': {
                            flex: { xs: '1 1 100%', sm: '1' },
                          },
                        }}
                      >
                        <Card
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 2,
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)' },
                            flex: 1,
                            minHeight: 120,
                          }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, fontSize: '1rem' }}>
                            Followers
                          </Typography>
                          <Typography variant="h2" sx={{ fontWeight: 800, mt: 2 }}>
                            {userDetails.followersCount}
                          </Typography>
                        </Card>
                        <Card
                          sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 2,
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)' },
                            flex: 1,
                            minHeight: 120,
                          }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, fontSize: '1rem' }}>
                            Following
                          </Typography>
                          <Typography variant="h2" sx={{ fontWeight: 800, mt: 2 }}>
                            {userDetails.followingCount}
                          </Typography>
                        </Card>
                      </Box>
                    </Box>

                    {/* Core Profile Information */}
                    <Card
                      sx={{
                        p: 3,
                        bgcolor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        width: '100%',
                        '&:hover': { boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <EditNote sx={{ color: '#525252', fontSize: '1.5rem' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Core Profile Information
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 3,
                          '& > *': {
                            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
                            minWidth: 0,
                          },
                        }}
                      >
                        {[
                          { label: 'Username', value: userDetails.username, Icon: Person },
                          { label: 'Full Name', value: userDetails.name, Icon: EditNote },
                          { label: 'Email Address', value: userDetails.email, Icon: Email },
                          {
                            label: 'Phone Number',
                            value: `${userDetails.countryCode} ${userDetails.mobile}`,
                            Icon: Phone,
                          },
                          { label: 'Bio', value: userDetails.bio || 'Not provided', Icon: Notes },
                          ...(userDetails.aadhar
                            ? [{ label: 'Aadhar', value: userDetails.aadhar, Icon: Badge }]
                            : []),
                        ].map((field, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              pb: 1,
                              minWidth: 0,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                              <field.Icon sx={{ fontSize: '1rem', color: '#525252' }} />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, color: '#525252' }}
                              >
                                {field.label}
                              </Typography>
                            </Stack>

                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: '#2d3748',
                                fontWeight: 500,
                                ml: 3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {field.value && field.value !== 'N/A' ? field.value : '-'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>

                    {/* Account Information */}
                    <Card
                      sx={{
                        p: 3,
                        bgcolor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        '&:hover': { boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Lock sx={{ color: '#525252', fontSize: '1.5rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>
                          Account Information
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          '& > *': {
                            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                            minWidth: 0,
                          },
                        }}
                      >
                        {[
                          { label: 'Account Type', value: userDetails.profileType, Icon: BarChart },
                          {
                            label: 'Account Status',
                            value: userDetails.status === 1 ? 'Active' : 'Inactive',
                            color: userDetails.status === 1 ? '#22c55e' : '#ef4444',
                            Icon: Bolt,
                          },
                          { label: 'Created Date', value: userDetails.createdAt, Icon: CalendarToday },
                          {
                            label: 'Verified',
                            value: userDetails.isVerified ? '✓ Yes' : '✗ No',
                            color: userDetails.isVerified ? '#22c55e' : '#ef4444',
                            Icon: CheckCircle,
                          },
                          { label: 'User Type', value: userDetails.userType, Icon: People },
                          ...(userDetails.referralCode
                            ? [
                                {
                                  label: 'Referral Code',
                                  value: userDetails.referralCode,
                                  Icon: CardGiftcard,
                                },
                              ]
                            : []),
                        ].map((field: any, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              pb: 1.5,
                              minWidth: 0,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                              <field.Icon sx={{ fontSize: '1rem', color: '#525252' }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: '#525252',
                                  fontSize: '0.85rem',
                                  m: 0,
                                }}
                              >
                                {field.label}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: field.color || '#2d3748',
                                fontWeight: field.color ? 700 : 500,
                                ml: 3.5,
                                wordBreak: 'break-word',
                              }}
                            >
                              {field.value && field.value !== 'N/A' ? field.value : '-'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Stack>
                </TabPanel>

                {/* Activity Feed Tab */}
                <TabPanel value={tabValue} index={1}>
                  <AdminFeedPage />
                </TabPanel>
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