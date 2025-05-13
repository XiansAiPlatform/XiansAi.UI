import React from 'react';
import { 
  List,
  ListItem,
  Typography
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useTheme } from '@mui/material/styles';
import { promptItemStyles, promptIconStyles, promptTextStyles } from './styles';

const PromptList = ({ prompts, iconColor, avatarColor, onPromptClick }) => {
  const theme = useTheme();

  return (
    <List sx={{ pl: 0 }}>
      {prompts.map((prompt, index) => (
        <ListItem 
          key={index}
          disableGutters
          disablePadding
          sx={promptItemStyles(theme, avatarColor)}
          onClick={() => onPromptClick(prompt)}
        >
          <LightbulbOutlinedIcon sx={promptIconStyles(iconColor)} />
          <Typography sx={promptTextStyles(theme)}>
            {prompt}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
};

export default PromptList; 