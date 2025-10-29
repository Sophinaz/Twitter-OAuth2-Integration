package errors

import (
	"fmt"
	"net/http"
)

type AppError struct {
	StatusCode int            
	Message    string         
	Err        error          
	Code       string         
	Meta       map[string]any 
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("error: %v | message: %s | code: %s", e.Err, e.Message, e.Code)
	}
	return fmt.Sprintf("message: %s | code: %s", e.Message, e.Code)
}

func NewAppError(status int, msg string, err error, code string) *AppError {
	return &AppError{
		StatusCode: status,
		Message:    msg,
		Err:        err,
		Code:       code,
	}
}

func BadRequest(msg string, err error) *AppError {
	return NewAppError(http.StatusBadRequest, msg, err, "BAD_REQUEST")
}

func Unauthorized(msg string, err error) *AppError {
	return NewAppError(http.StatusUnauthorized, msg, err, "UNAUTHORIZED")
}

func Forbidden(msg string, err error) *AppError {
	return NewAppError(http.StatusForbidden, msg, err, "FORBIDDEN")
}

func NotFound(msg string, err error) *AppError {
	return NewAppError(http.StatusNotFound, msg, err, "NOT_FOUND")
}

func Conflict(msg string, err error) *AppError {
	return NewAppError(http.StatusConflict, msg, err, "CONFLICT")
}

func UnprocessableEntity(msg string, err error) *AppError {
	return NewAppError(http.StatusUnprocessableEntity, msg, err, "UNPROCESSABLE_ENTITY")
}

// 5xx server errors
func InternalError(msg string, err error) *AppError {
	return NewAppError(http.StatusInternalServerError, msg, err, "INTERNAL_ERROR")
}