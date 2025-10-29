package handlers

import (
	"net/http"

	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/errors"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetUserProfile(c *gin.Context) {
    userID := c.GetUint("user_id")

    user, err := h.userService.GetUserProfile(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, errors.InternalError("failed to get user profile", err))
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": user})
}
