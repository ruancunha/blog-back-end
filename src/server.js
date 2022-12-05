import express from "express";
import { db, connectDoDb } from './db.js';

const app = express();
app.use(express.json());

app.get('/api/articles/:name', async (req, res) => {
  const { name } = req.params;

  const article = await db.collection('articles').findOne({ name });

  if (!article) return res.status(404).send('Article not found');

  return res.status(200).json(article);
});

app.put('/api/articles/:name/upvote', async (req, res) => {
  const { name } = req.params;
  
  await db.collection('articles').updateOne({ name }, { $inc: { upvotes: 1 } });

  const article = await db.collection('articles').findOne({ name });
  
  if (!article) return res.send('That article doesn\'t exist!');

  return res.json(article)
});

app.post('/api/articles/:name/comments', async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;
  
  await db.collection('articles').updateOne(
    { name }, 
    { $push: { comments: { postedBy, text } } }
  );

  const article = await db.collection('articles').findOne({ name });

  if (!article) return res.send('That article doesn\'t exist!');

  return res.json(article.comments);
});

connectDoDb(() => {
  console.log('Connected to Database');
  app.listen(8000, () => {
    console.log('Server is listening on port 8000');
  });
})
