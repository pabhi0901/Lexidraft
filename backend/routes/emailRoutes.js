const express = require('express');
const router = express.Router();
const {
  generateEmail,
  regenerateEmail,
  getEmails,
  getEmail,
  updateEmail,
  deleteEmail,
} = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/').get(getEmails);
router.route('/generate').post(generateEmail);
router.route('/regenerate/:id').post(regenerateEmail);
router.route('/:id').get(getEmail).put(updateEmail).delete(deleteEmail);

module.exports = router;
