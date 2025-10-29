package routers

import (
	"github.com/Sophinaz/Twitter-OAuth2-Integration/cmd/handlers"
	"github.com/gin-gonic/gin"
)

func NewTwitterRoute(router *gin.RouterGroup, h *handlers.TwitterHandler) {
	twitter := router.Group("/twitter")
	{
		twitter.POST("/callback", h.Callback)
	}
}