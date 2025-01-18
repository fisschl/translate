import { Box, Button, Stack } from "@mui/material";

const Articles: React.FC = () => {
  return (
    <Box>
      <Stack spacing={2} direction="row" className="m-4">
        <Button variant="text">Text</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
    </Box>
  );
};

export default Articles;
