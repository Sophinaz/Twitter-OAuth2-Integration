package routers

import (
	"github.com/Sophinaz/Twitter-OAuth2-Integration/cmd/handlers"
	"github.com/gin-gonic/gin"
)

func NewUserRoute(router *gin.RouterGroup, h *handlers.UserHandler) {
	user := router.Group("/user")
	{
		user.GET("/profile/:user_id", h.GetUserProfile)
	}
}