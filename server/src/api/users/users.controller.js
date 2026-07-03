const usersService = require('./users.service');
const { sendResponse, sendError } = require('../../common/utils/response');

class UsersController {
  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'No image file provided');
      }
      const userId = req.user.id;
      const imageUrl = req.file.path;
      const user = await usersService.updateProfileImage(userId, imageUrl);
      sendResponse(res, 200, user, 'Profile image updated successfully');
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message || 'Internal server error');
    }
  }
}

module.exports = new UsersController();
