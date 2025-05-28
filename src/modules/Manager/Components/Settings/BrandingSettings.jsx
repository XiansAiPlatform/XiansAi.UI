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
    DialogActions
} from "@mui/material";
import { useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import './Settings.css';
import { useSelectedOrg } from '../../contexts/OrganizationContext';

const BrandingSettings = () => {
    const { selectedOrg } = useSelectedOrg();
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#0ea5e9'); 
    const [secondaryColor, setSecondaryColor] = useState('#dc004e');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLogoFile(file);
            
            // Create a preview URL
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };
    
    const handleConfirmDelete = () => {
        setConfirmDelete(true);
    };
    
    const handleDeleteLogo = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setLogoFile(null);
        setConfirmDelete(false);
    };
    
    const handleColorChange = (colorType, color) => {
        if (colorType === 'primary') {
            setPrimaryColor(color);
        } else if (colorType === 'secondary') {
            setSecondaryColor(color);
        }
    };

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
    };

    return (
        <Paper className="ca-certificates-paper">
            <Typography variant="h6" gutterBottom>
                Branding Settings
            </Typography>

            <Grid container spacing={3}>
                {/* Company Logo Section */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
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
                                            background: '#f9f9f9'
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
                                            Change Logo
                                            <Input
                                                type="file"
                                                sx={{ display: 'none' }}
                                                inputProps={{ accept: 'image/*' }}
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
                                    
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        Upload Logo
                                        <Input
                                            type="file"
                                            sx={{ display: 'none' }}
                                            inputProps={{ accept: 'image/*' }}
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
                                        Size: {(logoFile.size / 1024).toFixed(2)} KB
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Theme Color Section */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Theme Colors
                            </Typography>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Stack spacing={3}>
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
                                        
                                        <Input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => handleColorChange('primary', e.target.value)}
                                            sx={{ width: '80px' }}
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
                                        
                                        <Input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                                            sx={{ width: '80px' }}
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
                <Grid item xs={12}>
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