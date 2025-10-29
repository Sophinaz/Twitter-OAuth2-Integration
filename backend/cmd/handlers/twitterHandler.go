package handlers

import (
	"net/http"

	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/dtos"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/errors"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/services"
	"github.com/gin-gonic/gin"
)

type TwitterHandler struct {
	twitterService services.TwitterService
}

func NewTwitterHandler(twitterService services.TwitterService) *TwitterHandler {
	return &TwitterHandler{twitterService: twitterService}
}

func (h *TwitterHandler) Callback(c *gin.Context) {
    var request dtos.TwitterCallbackRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, errors.BadRequest("invalid request", err))
        return
    }

    code := request.Code
    codeVerifier := request.CodeVerifier

    if code == "" {
        c.JSON(http.StatusBadRequest, errors.BadRequest("missing code", nil))
        return
    }

    err := h.twitterService.Callback(code, codeVerifier)
    if err != nil {
        c.JSON(http.StatusInternalServerError, errors.InternalError("failed to callback", err))
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "success"})
}
