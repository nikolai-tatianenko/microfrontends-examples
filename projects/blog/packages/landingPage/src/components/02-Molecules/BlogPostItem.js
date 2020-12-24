import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

/**
 * BlogPostItem component.
 *
 * @param product
 * @returns {JSX.Element}
 * @constructor
 */
export const BlogPostItem = ({ product }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image={product.image.src}
        title={product.image.alt}
      />

      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          {product.title}
        </Typography>
        <Typography>{product.body}</Typography>
      </CardContent>
    </Card>
  );
};

export default BlogPostItem;
