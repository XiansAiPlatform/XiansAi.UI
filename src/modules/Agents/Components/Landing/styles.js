/**
 * Centralized styles for Agent Landing components
 */

// Layout styles for the main container
export const containerStyles = (theme) => ({
  p: { xs: 3, md: 5 },
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  background: theme.palette.mode === 'dark' 
    ? '#1A1A1A' 
    : '#F9F9FB'
});

// Header typography styles
export const headerStyles = {
  title: {
    fontWeight: 600,
    mb: 3,
    textAlign: { xs: 'center', md: 'left' }
  },
  subtitle: {
    mb: 5,
    maxWidth: 600,
    textAlign: { xs: 'center', md: 'left' },
    fontSize: '1rem',
    letterSpacing: '0.01em'
  }
};

// Agent avatar styles
export const avatarStyles = (avatarColor, iconColor) => ({
  container: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mr: 2,
    backgroundColor: avatarColor,
    border: `1px solid ${iconColor}`,
  },
  icon: {
    width: 28,
    height: 28,
    filter: `opacity(0.9) drop-shadow(0 0 0.5px ${iconColor})`,
  }
});

// Divider styles
export const dividerStyles = (theme) => ({
  mb: 2.5,
  borderColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.06)'
});

// Prompt item styles
export const promptItemStyles = (theme, avatarColor) => ({
  mb: 2,
  p: 2.5,
  borderRadius: 2,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.03)'
    : avatarColor + '33', // Add 33 (20% opacity) to pastel color
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.07)'
      : avatarColor + '66', // Add 66 (40% opacity) to pastel color
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
  },
  display: 'flex',
  alignItems: 'flex-start'
});

// Prompt icon styles
export const promptIconStyles = (iconColor) => ({
  color: iconColor, 
  mr: 1.5,
  mt: 0.1,
  fontSize: '1.2rem'
});

// Prompt text styles
export const promptTextStyles = (theme) => ({
  fontSize: '1.05rem',
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  color: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.95)'
    : 'rgba(0,0,0,0.85)',
  fontWeight: 500
}); 