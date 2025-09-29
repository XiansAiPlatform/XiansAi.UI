import {
    Box,
    Paper,
    Typography,
    Button,
    Input,
    Stack,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Divider,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { useState, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import './Settings.css';
import { colorThemes } from '../../theme/mui-theme';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { useTenantsApi } from '../../services/tenants-api';
import { useTenant } from '../../contexts/TenantContext'; 

const BrandingSettings = () => {
    const { selectedOrg } = useSelectedOrg();
    const tenantApi = useTenantsApi();
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);    
    const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
    const [secondaryColor, setSecondaryColor] = useState('#dc004e');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [logoInfo, setLogoInfo] = useState({ width: 0, height: 0 });
    const [selectedTheme, setSelectedTheme] = useState('default');
    const { tenant, fetchTenant } = useTenant();
    const { userRoles } = useTenant();
    
    // Add a state variable to hold the tenantId
    const [tenantId, setTenantId] = useState(null);

      // Only allow sysAdmin or tenantAdmin
  const hasAccess = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');
    
    // Helper function to detect image type from base64 data
    const detectImageType = (base64String) => {
        if (!base64String) return 'png'; // Default fallback
        
        // Try to decode the first few bytes to detect the image type
        try {
            const decoded = atob(base64String.substring(0, 200)); // Decode first part for better detection
            
            // Check for SVG signature (more comprehensive)
            if (decoded.includes('<svg') || decoded.includes('<?xml') || 
                decoded.toLowerCase().includes('svg') || decoded.includes('<SVG')) {
                return 'svg+xml';
            }
            // Check for PNG signature
            if (decoded.startsWith('\x89PNG') || decoded.indexOf('PNG') !== -1) {
                return 'png';
            }
            // Check for JPEG signature
            if (decoded.startsWith('\xFF\xD8\xFF') || decoded.indexOf('JFIF') !== -1) {
                return 'jpeg';
            }
            // Check for GIF signature
            if (decoded.startsWith('GIF8') || decoded.startsWith('GIF9')) {
                return 'gif';
            }
            // Check for WebP signature
            if (decoded.indexOf('WEBP') !== -1) {
                return 'webp';
            }
        } catch (e) {
            console.warn('Error decoding base64 for image type detection:', e);
        }
        
        // Fallback: check base64 string for SVG patterns
        try {
            // Common base64 patterns for SVG start tags
            const svgPatterns = [
                'PHN2Zw', // '<svg'
                'PD94bWw', // '<?xml'
                'PHN2ZyB', // '<svg '
                'PD94bWwg', // '<?xml '
                'PCFET0NUWVBF' // '<!DOCTYPE'
            ];
            
            const upperBase64 = base64String.substring(0, 200).toUpperCase();
            for (const pattern of svgPatterns) {
                if (upperBase64.includes(pattern.toUpperCase())) {
                    return 'svg+xml';
                }
            }
        } catch (e) {
            console.warn('Error in SVG pattern detection:', e);
        }
        
        return 'png'; // Default fallback
    };
    
    const handleFileChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
            setLogoFile(file);

            // Create a preview URL
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);

            // Get image dimensions
            const dimensions = await getImageDimensions(file);
            console.log('Image dimensions:', dimensions);
            setLogoInfo(dimensions);
        }
    };

    const handleConfirmDelete = () => {
        setConfirmDelete(true);
    };

    const handleDeleteLogo = () => {
        if (previewUrl && !previewUrl.startsWith('data:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setLogoFile(null);
        setLogoInfo({ width: 0, height: 0 });
        updateTenantLogo(); // Call the API to update the logo
        setConfirmDelete(false);
    };

    // Function to update tenant logo via API
    const updateTenantLogo = async () => {
        try {
            const updateData = {
                logo: {
                    url: null,
                    imgBase64: null,
                    width: 0,
                    height: 0 
                }
            };
            const response = await tenantApi.updateTenant(tenantId, updateData);
            if (response) {
                showNotification('Logo removed successfully!');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
                
            } else {
                showNotification('Failed to remove logo.', 'error');
            }
        } catch (error) {
            console.error('Error removing logo:', error);
            showNotification('Failed to remove logo.', 'error');
        }
    }

    const handleNotificationClose = () => {
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleSubmit = async () => {
        // Update tenant with new branding settings
        if (!tenantId) {
            console.warn('No tenantId available for branding settings');
            showNotification('Please select an organization first.', 'warning');
        }
        else {
            setIsUploading(true);
            try {
                const updateData = {};
                if (logoFile) {
                    // Convert the logo to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(logoFile);

                    await new Promise((resolve, reject) => {
                        reader.onload = () => {
                            try {
                                // Extract the base64 string without the data URL prefix
                                const base64String = reader.result.split(',')[1];

                                updateData.logo = {
                                    imgBase64: base64String,
                                    width: logoInfo.width,
                                    height: logoInfo.height
                                };
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        };
                        reader.onerror = reject;
                    });
                } else if (previewUrl === null) {
                    // If logo was deleted
                    updateData.logo = null;
                }
                
                // Store the selected theme name
                updateData.theme = selectedTheme;

                // Call API to update branding settings using the tenantId
                const response = await tenantApi.updateTenant(tenantId, updateData);
                if (response) {  
                    showNotification('Branding settings updated successfully!');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    window.location.reload();
                }
                else {
                    showNotification('Failed to update branding settings.', 'error');
                }
            } catch (error) {
                console.error('Error updating branding settings:', error);
                showNotification('Failed to update branding settings.', 'error');
            } finally {
                setIsUploading(false); 
            }
        }
    };

    const getImageDimensions = (file) => {
        return new Promise((resolve) => {
            // Handle SVG files differently
            if (file.type === 'image/svg+xml') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const svgContent = e.target.result;
                        const parser = new DOMParser();
                        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                        const svgElement = svgDoc.querySelector('svg');
                        
                        if (svgElement) {
                            // Try to get dimensions from SVG attributes
                            let width = svgElement.getAttribute('width');
                            let height = svgElement.getAttribute('height');
                            
                            // If no explicit width/height, try viewBox
                            if (!width || !height) {
                                const viewBox = svgElement.getAttribute('viewBox');
                                if (viewBox) {
                                    const values = viewBox.split(' ');
                                    if (values.length === 4) {
                                        width = width || values[2];
                                        height = height || values[3];
                                    }
                                }
                            }
                            
                            // Parse numeric values (remove units like 'px')
                            const numericWidth = parseFloat(width) || 100;
                            const numericHeight = parseFloat(height) || 100;
                            
                            console.log('SVG dimensions from attributes:', { width: numericWidth, height: numericHeight });
                            resolve({ width: numericWidth, height: numericHeight });
                        } else {
                            // Fallback for SVG
                            resolve({ width: 100, height: 100 });
                        }
                    } catch (error) {
                        console.warn('Error parsing SVG dimensions:', error);
                        resolve({ width: 100, height: 100 });
                    }
                };
                reader.readAsText(file);
            } else {
                // Handle raster images (PNG, JPEG, etc.)
                const img = new Image();
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    console.log('Raster image dimensions:', { width, height });
                    resolve({ width, height });
                };
                img.onerror = () => {
                    console.warn('Error loading image for dimensions');
                    resolve({ width: 0, height: 0 });
                };
                img.src = URL.createObjectURL(file);
            }
        });
    };    // Handle theme selection change
    const handleThemeChange = (event) => {
        const themeName = event.target.value;
        setSelectedTheme(themeName);
        
        // Set primary and secondary colors from selected theme
        if (colorThemes[themeName]) {
            setPrimaryColor(colorThemes[themeName].primary.main);
            setSecondaryColor(colorThemes[themeName].secondary.main);
        }
    };

    // Load tenant data
    useEffect(() => {
        const fetchTenant = async () => {
            if (tenant) {
                setTenantId(tenant.id);
                
                try {
                    if (tenant.logo) {
                        if (tenant.logo.imgBase64) {
                            const detectedType = detectImageType(tenant.logo.imgBase64);
                            console.log('Setting preview with detected type:', detectedType);
                            setPreviewUrl(`data:image/${detectedType};base64,${tenant.logo.imgBase64}`);
                        } else if (tenant.logo.url) {
                            setPreviewUrl(tenant.logo.url);
                        }
                        if (tenant.logo.imgBase64 !== null) {
                            setLogoInfo({
                                width: tenant.logo.width || 0,
                                height: tenant.logo.height || 0
                            });
                        }
                    }
                    
                    // Load theme name
                    if (tenant.theme && colorThemes[tenant.theme]) {
                        setSelectedTheme(tenant.theme);
                        
                        // Update color pickers based on the selected theme
                        if (colorThemes[tenant.theme]) {
                            setPrimaryColor(colorThemes[tenant.theme].primary.main);
                            setSecondaryColor(colorThemes[tenant.theme].secondary.main);
                        }
                    }

                    // Load colors if available
                    if (tenant?.primaryColor) {
                        setPrimaryColor(tenant.primaryColor);
                    }
                    if (tenant?.secondaryColor) {
                        setSecondaryColor(tenant.secondaryColor);
                    }
                } catch (error) {
                    console.error('Error processing tenant data:', error);
                }
            }
            
        };

        fetchTenant();
    }, [selectedOrg, tenant, fetchTenant]);

    if (!hasAccess) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        You do not have permission to view this page.
      </Alert>
    );
  }

    return (
        <Paper className="ca-certificates-paper">
            <Typography variant="h6" gutterBottom>
                Branding Settings
            </Typography>
            <Grid container spacing={3}>
                {/* Company Logo Section */}
                <Grid
                    size={{
                        xs: 12,
                        md: 6
                    }}>
                    <Card 
                        elevation={0}
                        sx={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-paper)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'var(--border-color-hover)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Company Logo
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {previewUrl ? (
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    <img
                                        src={previewUrl}
                                        alt="Logo Preview"
                                        style={{
                                            maxWidth: '250px',
                                            maxHeight: '120px',
                                            padding: '10px',
                                            border: '1px dashed #ccc',
                                            borderRadius: '4px',
                                            background: '#f9f9f9',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                    />

                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleConfirmDelete}
                                            startIcon={<DeleteIcon />}
                                            sx={{ mr: 1 }}
                                        >
                                            Remove
                                        </Button>

                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<CloudUploadIcon />}
                                        >
                                            Change Logo                                        <Input
                                            type="file"
                                            sx={{ display: 'none' }}
                                            inputProps={{ 
                                                accept: 'image/*,.svg',
                                                title: 'Supported formats: PNG, JPEG, GIF, SVG, WebP'
                                            }}
                                            onChange={handleFileChange}
                                        />
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        border: '2px dashed #ccc',
                                        borderRadius: '8px',
                                        py: 4,
                                        px: 2,
                                        backgroundColor: '#f9f9f9',
                                        mb: 2
                                    }}
                                >
                                    <Typography variant="body1" color="textSecondary" gutterBottom>
                                        No logo uploaded yet
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                                        Supported formats: PNG, JPEG, GIF, SVG, WebP
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        Upload Logo
                                        <Input
                                            type="file"
                                            sx={{ display: 'none' }}
                                            inputProps={{ 
                                                accept: 'image/*,.svg',
                                                title: 'Supported formats: PNG, JPEG, GIF, SVG, WebP'
                                            }}
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </Box>
                            )}

                            {logoFile && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Selected file: {logoFile.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Type: {logoFile.type || 'Unknown'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Size: {(logoFile.size / 1024).toFixed(2)} KB
                                    </Typography>
                                    {logoInfo.width > 0 && logoInfo.height > 0 && (
                                        <Typography variant="body2" color="textSecondary">
                                            Dimensions: {logoInfo.width} × {logoInfo.height} pixels
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Theme Color Section */}
                <Grid
                    size={{
                        xs: 12,
                        md: 6
                    }}>
                    <Card 
                        elevation={0}
                        sx={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-paper)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'var(--border-color-hover)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        <CardContent>                            
                            <Typography variant="h6" gutterBottom>
                                Theme Colors
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Theme Selection
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="theme-select-label">Theme</InputLabel>
                                        <Select
                                            labelId="theme-select-label"
                                            id="theme-select"
                                            value={selectedTheme}
                                            label="Theme"
                                            onChange={handleThemeChange}
                                        >                                            
                                            <MenuItem value="default">Default Theme</MenuItem>
                                            <MenuItem value="nordicMidnightSun">Midnight Sun (Midnattssol)</MenuItem>
                                            <MenuItem value="nordicForest">Forest (Skogsrike)</MenuItem>
                                            <MenuItem value="nordicIce">Ice (Isblink)</MenuItem>
                                            <MenuItem value="nordicAurora">Aurora (Nordlys)</MenuItem>
                                            <MenuItem value="nordicFjord">Fjord (Fjordblå)</MenuItem>
                                            <MenuItem value="nordicWinter">Winter (Vintervit)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Primary Color
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: primaryColor,
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                mr: 2
                                            }}
                                        />

                                        <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                            {primaryColor.toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Secondary Color
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: secondaryColor,
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                mr: 2
                                            }}
                                        />

                                        <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                            {secondaryColor.toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1">Preview</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                        <Button variant="contained" sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: primaryColor } }}>
                                            Primary Button
                                        </Button>

                                        <Button variant="contained" color="secondary" sx={{ bgcolor: secondaryColor, '&:hover': { bgcolor: secondaryColor } }}>
                                            Secondary Button
                                        </Button>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Save Button & Notifications */}
                <Grid size={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleSubmit}
                            disabled={isUploading || !selectedOrg}
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        >
                            {isUploading ? 'Saving...' : 'Save Branding Settings'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
            >
                <DialogTitle>Remove Logo?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove the company logo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button onClick={handleDeleteLogo} color="error" autoFocus>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleNotificationClose} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default BrandingSettings;