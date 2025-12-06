const express = require('express');
const router = express.Router();
const {
  generateBulletPoints,
  regenerateBulletPoints,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/').get(getProjects);
router.route('/generate').post(generateBulletPoints);
router.route('/regenerate/:id').post(regenerateBulletPoints);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
