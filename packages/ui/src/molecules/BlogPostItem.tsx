import { Card, CardContent, CardMedia, Typography } from "@mui/material";

export interface BlogPostItemProps {
  title: string;
  body: string;
  imageUrl: string;
}

/** A single post card: 16:9 cover, title and excerpt. */
export function BlogPostItem({ title, body, imageUrl }: BlogPostItemProps) {
  return (
    <Card
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      data-test-id="blog-post-item"
      component="article"
    >
      <CardMedia
        component="img"
        image={imageUrl}
        alt=""
        sx={{ aspectRatio: "16 / 9" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        <Typography color="text.secondary">{body}</Typography>
      </CardContent>
    </Card>
  );
}
