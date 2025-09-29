import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Badge, IconButton, Tooltip } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AirIcon from '@mui/icons-material/Air';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Link, useLocation } from 'react-router-dom';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import { useAuditContext } from '../../contexts/AuditContext';
import { useTenant } from '../../contexts/TenantContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const NAV_ITEMS = [
  {
    to: '/manager/definitions',
    icon: <CodeOutlinedIcon />,
    label: 'Agent Definitions',
    isSelected: (pathname) => pathname === '/manager/definitions' || pathname.startsWith('/manager/definitions/'),
  },
  {
    to: '/manager/runs',
    icon: <AirIcon />,
    label: 'Agent Runs',
    isSelected: (pathname) => pathname === '/manager/runs' || pathname.startsWith('/manager/runs/') || pathname === '/manager',
  },

  {
    to: '/manager/knowledge',
    icon: <MenuBookOutlinedIcon />,
    label: 'Knowledge Base',
    isSelected: (pathname) => pathname === '/manager/knowledge' || pathname.startsWith('/manager/knowledge/'),
  },
  {
    to: '/manager/messaging',
    icon: <ForumOutlinedIcon />,
    label: 'Messaging',
    isSelected: (pathname) => pathname === '/manager/messaging' || pathname.startsWith('/manager/messaging/'),
  },
  {
    to: '/manager/auditing',
    icon: <ChecklistOutlinedIcon />,
    label: 'Auditing',
    isSelected: (pathname) => pathname === '/manager/auditing' || pathname.startsWith('/manager/auditing/'),
  },
  {
    to: '/manager/settings',
    icon: <SettingsOutlinedIcon />,
    label: 'Tenant Settings',
    isSelected: (pathname) => pathname === '/manager/settings' || pathname.startsWith('/manager/settings/'),
  },
  {
    to: '/manager/admin',
    icon: <AdminPanelSettingsIcon />,
    label: 'System Admin',
    isSelected: (pathname) => pathname === '/manager/admin' || pathname.startsWith('/manager/admin/'),
  },
];

// Reusable NavItem component
const NavItem = ({ to, icon, label, isSelected, pathname, onNavItemClick, badgeCount = 0, isCollapsed }) => {
  const selected = isSelected(pathname);
  
  const content = (
    <ListItem
      component={Link}
      to={to}
      className={`nav-item ${selected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      onClick={onNavItemClick}
      sx={{
        mb: 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        px: isCollapsed ? 1 : 2,
        '&:hover': {
          transform: isCollapsed ? 'scale(1.05)' : 'translateX(4px)',
          backgroundColor: 'var(--bg-hover)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: selected ? '70%' : '0%',
          backgroundColor: 'var(--primary)',
          transition: 'height 0.3s ease',
          borderRadius: '0 3px 3px 0'
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: isCollapsed ? 'auto' : '40px',
          color: selected ? 'var(--primary)' : 'var(--text-secondary)',
          opacity: selected ? 1 : 0.7,
          mr: isCollapsed ? 0 : 2
        }}
      >
        {badgeCount > 0 ? (
          <Badge
            badgeContent={badgeCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                height: '18px',
                minWidth: '18px',
                right: isCollapsed ? -4 : -8,
                top: isCollapsed ? -4 : -8
              }
            }}
          >
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      {!isCollapsed && (
        <ListItemText
          primary={label}
          sx={{
            '& .MuiTypography-root': {
              fontSize: 'var(--text-sm) !important',
              fontWeight: selected ? '600 !important' : '500 !important',
              color: selected ? 'var(--text-primary) !important' : 'var(--text-secondary) !important',
              fontFamily: 'var(--font-family) !important',
              letterSpacing: '0.2px !important'
            }
          }}
        />
      )}
    </ListItem>
  );

  return isCollapsed ? (
    <Tooltip title={label} placement="right" arrow>
      {content}
    </Tooltip>
  ) : content;
};

const LeftNav = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { pathname } = useLocation();
  const isMobile = window.innerWidth <= 768;
  const { navErrorCount, resetNavErrorCount } = useAuditContext();
  const { userRoles } = useTenant();

  // Filter navigation items based on user permissions
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.to === '/manager/admin') {
      return userRoles.includes('SysAdmin');
    }
    return true;
  });

  const handleNavItemClick = (to) => {
    if (to === '/auditing' && navErrorCount > 0) {
      resetNavErrorCount();
    }
    
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isMobile && isOpen && <div className="nav-overlay open" onClick={onClose}></div>}
      <Box className={`nav ${isOpen ? 'open' : ''} ${isCollapsed && !isMobile ? 'collapsed' : ''}`}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          position: 'relative'
        }}>
          {!isMobile && (
            <Box sx={{ 
              position: 'absolute',
              right: isCollapsed ? 'auto' : '-12px',
              left: isCollapsed ? '50%' : 'auto',
              top: '20px',
              transform: isCollapsed ? 'translateX(-50%)' : 'none',
              zIndex: 10
            }}>
              <Tooltip title={isCollapsed ? 'Expand menu' : 'Collapse menu'} placement="right">
                <IconButton
                  onClick={onToggleCollapse}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--bg-paper)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    width: '24px',
                    height: '24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {isCollapsed ? <ChevronRightIcon sx={{ fontSize: '16px' }} /> : <ChevronLeftIcon sx={{ fontSize: '16px' }} />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Box sx={{ mb: 3, mt: isMobile ? 0 : 5 }}>
            {!isCollapsed && (
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '1px',
                  opacity: 0.7,
                  padding: '0 16px',
                  marginBottom: '8px',
                  transition: 'opacity 0.3s ease'
                }}
              >
                NAVIGATION
              </Typography>
            )}
            <List>
              {filteredNavItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  pathname={pathname}
                  onNavItemClick={() => handleNavItemClick(item.to)}
                  badgeCount={item.to === '/auditing' ? navErrorCount : 0}
                  isCollapsed={isCollapsed && !isMobile}
                />
              ))}
            </List>
          </Box>
          
          <Box sx={{ mt: 'auto', mb: 2, opacity: 0.6 }}>
            <Divider sx={{ mb: 2 }} />
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  padding: '0 16px',
                  textAlign: 'center',
                  transition: 'opacity 0.3s ease'
                }}
              >
                Xians.ai &copy; {new Date().getFullYear()}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LeftNav; 
