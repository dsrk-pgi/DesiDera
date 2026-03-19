const Feedback = require('../models/Feedback');

async function submitFeedback(req, res) {
  const { name, rating, comments } = req.body;

  if (!name || !Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: 'Invalid feedback payload' });
  }

  try {
    await Feedback.create({
      name: String(name).trim(),
      rating: Number(rating),
      comments: comments ? String(comments).trim() : ''
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

module.exports = { submitFeedback };
